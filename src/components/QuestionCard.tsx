import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Question, ValidationRules } from '../types';
import { ProgressBar } from './ProgressBar';

interface QuestionCardProps {
  question: Question;
  onAnswer: (response: string | boolean | number | string[], imageAnalysis?: string) => void;
  total: number;
  current: number;
  analyzeImage: (imageBase64: string) => Promise<string>;
}

export const QuestionCard = ({ 
  question, 
  onAnswer, 
  total, 
  current,
}: QuestionCardProps) => {
  const [answer, setAnswer] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setAnswer('');
    setError('');
  }, [question.text]);

  const validateAnswer = (value: string, validation?: ValidationRules): boolean => {
    if (!validation) return true;

    if (validation.required && !value.trim()) {
      setError('Ce champ est requis');
      return false;
    }

    if (validation.minLength && value.length < validation.minLength) {
      setError(`Minimum ${validation.minLength} caractères requis`);
      return false;
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      setError(`Maximum ${validation.maxLength} caractères autorisés`);
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (validateAnswer(answer, question.validation)) {
      onAnswer(answer);
      setAnswer('');
      setError('');
    }
  };

  const handleYesNoAnswer = (value: boolean) => {
    onAnswer(value);
  };

  const renderInput = () => {
    switch (question.type) {
      case 'yesno':
        return (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => handleYesNoAnswer(true)}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-lg
                       hover:bg-white/10 transition-all text-center"
            >
              Oui
            </button>
            <button
              onClick={() => handleYesNoAnswer(false)}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-lg
                       hover:bg-white/10 transition-all text-center"
            >
              Non
            </button>
          </div>
        );

      case 'textarea':
        return (
          <div className="space-y-4">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-lg
                       text-white resize-none min-h-[120px]
                       focus:outline-none focus:border-white/40
                       placeholder-gray-500"
              placeholder="Écrivez votre réponse ici..."
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-lg
                       hover:bg-white/20 transition-all disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </div>
        );

      case 'text':
      default:
        return (
          <div className="space-y-4">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full p-4 bg-white/5 border border-white/20 rounded-lg
                       text-white focus:outline-none focus:border-white/40
                       placeholder-gray-500"
              placeholder="Votre réponse..."
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-lg
                       hover:bg-white/20 transition-all disabled:opacity-50
                       disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.text}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-lg mx-auto p-6 space-y-6"
      >
        <ProgressBar current={current} total={total} />

        <div className="text-center space-y-4">
          <h2 className="text-2xl font-medium mb-8">
            {question.text}
          </h2>
        </div>

        <div className="space-y-6">
          {renderInput()}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
