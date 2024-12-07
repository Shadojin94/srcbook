import { FileDown, Headphones, User2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ActionCardsProps {
  onActionSelect: (action: 'pdf' | 'audio' | 'consult') => void;
}

export const ActionCards = ({ onActionSelect }: ActionCardsProps) => {
  const cards = [
    {
      id: 'pdf',
      icon: <FileDown size={24} />,
      title: 'PDF',
      subtitle: 'Télécharger',
    },
    {
      id: 'audio',
      icon: <Headphones size={24} />,
      title: 'Audio',
      subtitle: 'Écouter',
    },
    {
      id: 'consult',
      icon: <User2 size={24} />,
      title: 'Expert',
      subtitle: 'Consulter',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto p-6">
      {cards.map((card, index) => (
        <motion.button
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onActionSelect(card.id as 'pdf' | 'audio' | 'consult')}
          className="flex flex-col items-center justify-center p-6 bg-white/5 
                   border border-white/20 rounded-xl hover:bg-white/10 
                   transition-all group"
        >
          <div className="mb-4 p-3 bg-white/10 rounded-full group-hover:bg-white/20 
                        transition-all">
            {card.icon}
          </div>
          <h3 className="text-xl font-medium mb-2">{card.title}</h3>
          <p className="text-gray-400">{card.subtitle}</p>
        </motion.button>
      ))}
    </div>
  );
};
