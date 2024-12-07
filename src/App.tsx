import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { WelcomeScreen } from './components/WelcomeScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultsScreen } from './components/ResultsScreen';
import { ActionCards } from './components/ActionCards';
import { RegistrationForm } from './components/RegistrationForm';
import type { Answer, QuestionnaireState, UserInfo } from './types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '',
  dangerouslyAllowBrowser: true
});

const ASSISTANT_ID = 'asst_qNjHPa1v7IGqre3sCq515vLi';
const TOTAL_QUESTIONS = 7;

// Function to detect if a question is a yes/no question
const isYesNoQuestion = (question: string): boolean => {
  const yesNoPatterns = [
    /^(est(-|\s)?ce que)/i,
    /\?$/,
    /^as(-|\s)?tu/i,
    /^avez(-|\s)?vous/i,
    /^ressens(-|\s)?tu/i,
    /^ressentez(-|\s)?vous/i,
  ];
  
  return yesNoPatterns.some(pattern => pattern.test(question)) &&
         question.length < 100;
};

function App() {
  const [state, setState] = useState<QuestionnaireState>({
    currentQuestion: { 
      text: "Comment te sens-tu aujourd'hui ?", 
      type: 'textarea',
      allowImage: true 
    },
    answers: [],
    isComplete: false,
  });

  const [showWelcome, setShowWelcome] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showActionCards, setShowActionCards] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const getNextQuestion = async (answers: Answer[]): Promise<string> => {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant médical qui pose des questions courtes et précises pour comprendre les symptômes. Pose une seule question à la fois. Limite-toi à 7 questions maximum. Les questions doivent être claires et directes comme 'As-tu mal à la gorge ?' ou 'Ressens-tu de la fièvre ?'"
          },
          {
            role: "user",
            content: `Voici les réponses précédentes du patient: ${answers.map(a => `Q: ${a.question} R: ${a.response}`).join('. ')}. Quelle est la prochaine question à poser ?`
          }
        ]
      });

      return completion.choices[0]?.message?.content || "Comment vous sentez-vous maintenant ?";
    } catch (error) {
      console.error('Error getting next question:', error);
      return "Y a-t-il autre chose à signaler ?";
    }
  };

  const analyzeWithAssistant = async (answers: Answer[]): Promise<string> => {
    try {
      setLoadingProgress(25);
      const thread = await openai.beta.threads.create();
      setLoadingProgress(40);

      // Formatage amélioré des réponses du patient
      const formattedAnswers = answers.map(a => {
        let response = typeof a.response === 'boolean' ? (a.response ? 'Oui' : 'Non') : a.response;
        return `Question: ${a.question}\nRéponse: ${response}`;
      }).join('\n\n');

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Analyse détaillée du patient:\n\n${formattedAnswers}\n\nJ'ai besoin d'une analyse approfondie avec des remèdes naturels et/ou médicaux personnalisés. Organise ta réponse en sections:\n1. Analyse des symptômes\n2. Diagnostic possible\n3. Remèdes recommandés (détaille les remèdes naturels, médicaments si nécessaire, et autres recommandations)\n4. Conseils de prévention`
      });
      setLoadingProgress(60);

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
        instructions: `Tu es un assistant médical spécialisé. Analyse les symptômes du patient et fournis une réponse détaillée et personnalisée. Pour chaque remède suggéré, explique pourquoi il est approprié par rapport aux symptômes spécifiques mentionnés. Sois précis dans tes recommandations. Inclus toujours des remèdes naturels ET médicaux quand c'est approprié. Organise ta réponse en sections claires.`
      });
      setLoadingProgress(80);

      const checkCompletion = async () => {
        const runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
        if (runStatus.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(thread.id);
          const assistantMessage = messages.data.find(m => m.role === 'assistant');
          return assistantMessage?.content[0]?.text?.value || "Désolé, je n'ai pas pu analyser vos réponses.";
        } else if (runStatus.status === 'failed') {
          throw new Error('Assistant analysis failed');
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return checkCompletion();
        }
      };

      const response = await checkCompletion();
      setLoadingProgress(100);
      return response;

    } catch (error) {
      console.error('Error analyzing with assistant:', error);
      return "Désolé, une erreur est survenue lors de l'analyse de vos réponses.";
    }
  };

  const handleAnswer = async (response: string | boolean | number, imageAnalysis?: string) => {
    const newAnswers = [...state.answers, {
      question: state.currentQuestion.text,
      response,
      imageAnalysis
    }];

    if (newAnswers.length >= TOTAL_QUESTIONS) {
      setState({
        currentQuestion: null,
        answers: newAnswers,
        isComplete: true
      });
      setIsLoading(true);
      const analysis = await analyzeWithAssistant(newAnswers);
      setAiResponse(analysis);
      setIsLoading(false);
      setShowActionCards(true);
      return;
    }

    const nextQuestionText = await getNextQuestion(newAnswers);
    const isYesNo = isYesNoQuestion(nextQuestionText);

    setState({
      currentQuestion: {
        text: nextQuestionText,
        type: isYesNo ? 'yesno' : 'text',
        allowImage: !isYesNo
      },
      answers: newAnswers,
      isComplete: false
    });
  };

  const handleActionSelect = (action: 'pdf' | 'audio' | 'consult') => {
    if (!userInfo) {
      localStorage.setItem('selectedAction', action);
      window.location.href = '/register';
    } else {
      handleActionWithAuth(action);
    }
  };

  const handleActionWithAuth = (action: 'pdf' | 'audio' | 'consult') => {
    switch (action) {
      case 'pdf':
        console.log('Downloading PDF...');
        break;
      case 'audio':
        console.log('Playing audio...');
        break;
      case 'consult':
        console.log('Starting consultation...');
        break;
    }
  };

  const handleRegistrationComplete = (info: UserInfo) => {
    setUserInfo(info);
    const selectedAction = localStorage.getItem('selectedAction');
    if (selectedAction) {
      handleActionWithAuth(selectedAction as 'pdf' | 'audio' | 'consult');
      localStorage.removeItem('selectedAction');
    }
  };

  const handleStart = () => {
    setShowWelcome(false);
    setState({
      currentQuestion: { 
        text: "Comment te sens-tu aujourd'hui ?", 
        type: 'textarea',
        allowImage: true 
      },
      answers: [],
      isComplete: false
    });
  };

  const handleRestart = () => {
    setState({
      currentQuestion: { 
        text: "Comment te sens-tu aujourd'hui ?", 
        type: 'textarea',
        allowImage: true 
      },
      answers: [],
      isComplete: false
    });
    setShowWelcome(true);
    setAiResponse('');
    setLoadingProgress(0);
    setShowActionCards(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/register" element={
          <RegistrationForm onComplete={handleRegistrationComplete} />
        } />
        <Route path="/" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
            {showWelcome ? (
              <WelcomeScreen onStart={handleStart} />
            ) : state.isComplete ? (
              <ResultsScreen 
                answers={state.answers} 
                onRestart={handleRestart}
                aiResponse={aiResponse}
                isLoading={isLoading}
                loadingProgress={loadingProgress}
                showActionCards={showActionCards}
                onActionSelect={handleActionSelect}
              />
            ) : (
              state.currentQuestion && (
                <QuestionCard
                  question={state.currentQuestion}
                  onAnswer={handleAnswer}
                  total={TOTAL_QUESTIONS}
                  current={state.answers.length + 1}
                  analyzeImage={async (image: string) => "Analyse d'image désactivée pour les questions suivantes"}
                />
              )
            )}
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
