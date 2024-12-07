import type { Question, Answer, QuestionGenerationPrompt } from '../types';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'YOUR_API_KEY',
  dangerouslyAllowBrowser: true
});

export class QuestionService {
  static async generateInitialQuestions(context: string): Promise<Question[]> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that generates questions for a dynamic questionnaire. 
            Generate questions with appropriate types and validation rules.
            Response format should be a JSON array of questions with:
            - id: unique string
            - text: question text
            - type: one of [text, number, yesno, date, radio, checkbox, textarea]
            - validation: object with rules like required, min, max, etc.
            Make questions clear, concise, and logical.`
          },
          {
            role: "user",
            content: `Generate initial questions for context: ${context}`
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      return response ? JSON.parse(response) : [];
    } catch (error) {
      console.error('Error generating initial questions:', error);
      return [];
    }
  }

  static async getNextQuestion(prompt: QuestionGenerationPrompt): Promise<Question | null> {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `Based on previous answers and context, determine the next most appropriate question.
            Follow these rules:
            - If asking about quantity, use type: 'number'
            - If starting with "Est-ce que" or yes/no question, use type: 'yesno'
            - If asking for description, use type: 'textarea'
            - If asking about timing, use type: 'date'
            - If providing options, use type: 'radio' or 'checkbox'
            Response should be a single JSON question object.`
          },
          {
            role: "user",
            content: JSON.stringify(prompt)
          }
        ]
      });

      const response = completion.choices[0]?.message?.content;
      return response ? JSON.parse(response) : null;
    } catch (error) {
      console.error('Error getting next question:', error);
      return null;
    }
  }

  static determineQuestionType(question: string): string {
    if (/combien|nombre|montant/i.test(question)) return 'number';
    if (/^est(-|\s)?ce(\s)?que|^avez(-|\s)?vous|^as(-|\s)?tu/i.test(question)) return 'yesno';
    if (/décrivez|expliquez|détaillez/i.test(question)) return 'textarea';
    if (/quand|date|moment/i.test(question)) return 'date';
    if (/choisissez|sélectionnez|parmi|suivants/i.test(question)) return 'radio';
    return 'text';
  }

  static shouldSkipQuestion(question: Question, answers: Answer[]): boolean {
    if (!question.dependsOn) return false;

    const dependentAnswer = answers.find(a => a.questionId === question.dependsOn?.questionId);
    if (!dependentAnswer) return false;

    return dependentAnswer.response !== question.dependsOn.expectedValue;
  }

  static validateAnswer(answer: any, question: Question): boolean {
    const validation = question.validation;
    if (!validation) return true;

    switch (question.type) {
      case 'number':
        const num = Number(answer);
        if (validation.min !== undefined && num < validation.min) return false;
        if (validation.max !== undefined && num > validation.max) return false;
        break;
      case 'text':
      case 'textarea':
        if (typeof answer !== 'string') return false;
        if (validation.minLength && answer.length < validation.minLength) return false;
        if (validation.maxLength && answer.length > validation.maxLength) return false;
        if (validation.pattern && !new RegExp(validation.pattern).test(answer)) return false;
        break;
      case 'radio':
      case 'checkbox':
        if (validation.options && !validation.options.includes(answer)) return false;
        break;
    }
    return true;
  }
}
