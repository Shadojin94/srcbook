import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-6 
                 bg-black text-white"
    >
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl md:text-4xl text-center mb-12 max-w-2xl"
      >
        Bienvenue. Prêt à découvrir des remèdes qui te ressemblent ?
      </motion.h1>
      
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={onStart}
        className="px-12 py-4 border border-white rounded-xl bg-transparent 
                 text-white hover:bg-white/10 transition-all duration-300 
                 text-lg md:text-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Commencer
      </motion.button>
    </motion.div>
  );
};
