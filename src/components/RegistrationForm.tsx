import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface RegistrationFormProps {
  onComplete: (userInfo: { name: string; email: string }) => void;
}

export const RegistrationForm = ({ onComplete }: RegistrationFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const location = useLocation();

  useEffect(() => {
    // Generate custom message based on selected action
    const selectedAction = localStorage.getItem('selectedAction');
    let message = '';
    
    switch (selectedAction) {
      case 'pdf':
        message = "Pour recevoir votre guide personnalisé en PDF et suivre vos progrès, merci de compléter votre inscription. Vous aurez accès à des conseils détaillés et adaptés à votre situation.";
        break;
      case 'audio':
        message = "Pour accéder à votre guide audio personnalisé et bénéficier d'exercices guidés, merci de finaliser votre inscription. Une expérience sonore apaisante vous attend.";
        break;
      case 'consult':
        message = "Pour bénéficier d'une consultation personnalisée avec nos experts et recevoir un suivi adapté, merci de compléter votre profil. Nous vous guiderons pas à pas.";
        break;
      default:
        message = "Pour accéder à nos services personnalisés et recevoir des recommandations sur mesure, merci de compléter votre inscription. Une expérience unique vous attend.";
    }
    
    setCustomMessage(message);
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      onComplete({ name, email });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-6"
    >
      <h2 className="text-2xl font-medium mb-4">Finalisons votre accès</h2>
      
      <p className="text-gray-400 mb-8">
        {customMessage}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Nom
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg 
                     text-white focus:border-white/40 focus:outline-none"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/20 rounded-lg 
                     text-white focus:border-white/40 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-white/10 border border-white/20 rounded-lg 
                   hover:bg-white/20 transition-all text-lg mt-8"
        >
          Accéder à mon espace
        </button>
      </form>
    </motion.div>
  );
};
