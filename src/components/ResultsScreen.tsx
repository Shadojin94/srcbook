import { motion } from 'framer-motion';
import type { Answer } from '../types';
import { Loader2, ChevronDown, Brain } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ActionCards } from './ActionCards';

interface ResultsScreenProps {
  answers: Answer[];
  onRestart: () => void;
  aiResponse: string;
  isLoading: boolean;
  loadingProgress: number;
  showActionCards: boolean;
  onActionSelect: (action: 'pdf' | 'audio' | 'consult') => void;
}

const LoadingState = ({ progress }: { progress: number }) => {
  const steps = [
    { progress: 25, text: "Création de l'analyse..." },
    { progress: 40, text: "Analyse de vos réponses..." },
    { progress: 60, text: "Génération des recommandations..." },
    { progress: 80, text: "Finalisation..." },
    { progress: 100, text: "Analyse complète!" },
  ];

  const currentStep = steps.findIndex(step => progress <= step.progress);
  const stepText = currentStep >= 0 ? steps[currentStep].text : "Analyse terminée";

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-6">
      <div className="relative">
        <Brain className="w-12 h-12 animate-pulse" />
        <Loader2 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-spin" size={32} />
      </div>
      
      <div className="w-full max-w-xs space-y-4">
        <div className="bg-white/10 rounded-full h-2">
          <motion.div 
            className="bg-white h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">
            {stepText}
          </p>
          <p className="text-sm text-gray-400">
            Assistant QuickCure en action
          </p>
        </div>
      </div>
    </div>
  );
};

const AnswersAccordion = ({ answers }: { answers: Answer[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-white/5 rounded-xl overflow-hidden shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-all"
      >
        <span className="text-xl font-medium">Voir tes réponses</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={24} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6 border-t border-white/10">
              {answers.map((answer, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={index}
                  className="bg-white/5 rounded-xl p-6"
                >
                  <p className="text-sm text-gray-400 mb-4">{answer.question}</p>
                  <p className="text-lg leading-relaxed">
                    {typeof answer.response === 'boolean' 
                      ? (answer.response ? 'Oui' : 'Non')
                      : answer.response}
                  </p>
                  {answer.imageAnalysis && (
                    <div className="mt-6 p-4 bg-white/5 rounded-lg">
                      <p className="text-sm text-gray-400">
                        Analyse de l'image : {answer.imageAnalysis}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ResultsScreen = ({ 
  answers, 
  onRestart, 
  aiResponse, 
  isLoading,
  loadingProgress,
  showActionCards,
  onActionSelect
}: ResultsScreenProps) => {
  const variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      className="min-h-screen w-full flex flex-col items-center p-4 md:p-6 bg-black text-white"
    >
      <div className="w-full max-w-2xl flex-1 space-y-8 md:space-y-12">
        <motion.div 
          variants={variants}
          className="text-center md:text-left"
        >
          <h2 className="text-3xl font-medium mb-4">
            Notre analyse
          </h2>
          <p className="text-gray-400">
            Analyse par l'Assistant QuickCure
          </p>
        </motion.div>
        
        <motion.div variants={variants}>
          <AnswersAccordion answers={answers} />
        </motion.div>

        <motion.div 
          variants={variants}
          className="bg-white/5 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h3 className="text-2xl font-medium">
              Recommandations personnalisées
            </h3>
            <p className="text-gray-400 mt-2">
              Générées par notre Assistant spécialisé
            </p>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <LoadingState progress={loadingProgress} />
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {aiResponse.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-lg leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>

        {showActionCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="py-8"
          >
            <h3 className="text-2xl font-medium mb-8 text-center">
              Découvrez plus de contenu
            </h3>
            <ActionCards onActionSelect={onActionSelect} />
          </motion.div>
        )}

        <motion.button
          variants={variants}
          onClick={onRestart}
          className="w-full max-w-md mx-auto px-8 py-4 border border-white rounded-xl
                   hover:bg-white/10 transition-all text-lg mb-8 mt-8"
        >
          Commencer une nouvelle consultation
        </motion.button>
      </div>
    </motion.div>
  );
};
