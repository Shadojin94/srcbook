import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import type { Answer } from '../types';

interface AccordionProps {
  title: string;
  answers: Answer[];
}

export const Accordion = ({ title, answers }: AccordionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
      >
        <span className="text-lg font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 space-y-2">
              {answers.map((answer, index) => (
                <div key={index} className="p-4 bg-white/5 rounded-lg ml-4">
                  <p className="text-sm text-gray-400 mb-1">{answer.question}</p>
                  <p className="text-lg">
                    {typeof answer.response === 'boolean' 
                      ? (answer.response ? 'Oui' : 'Non')
                      : answer.response}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
