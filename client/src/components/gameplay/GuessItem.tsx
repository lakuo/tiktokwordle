import { motion } from 'framer-motion';
import { GuessMessage } from '../../types';
import { GuessRow } from './GuessRow';

interface GuessItemProps {
  guess: GuessMessage;
  index: number;
}

export function GuessItem({ guess, index }: GuessItemProps) {
  return (
    <motion.div
      className="guess-item"
      initial={{ opacity: 0, x: -20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 200,
        damping: 20
      }}
      layout
    >
      <div className="avatar">
        {guess.user.avatar ? (
          <img src={guess.user.avatar} alt={guess.user.name} />
        ) : (
          guess.user.name.charAt(0).toUpperCase()
        )}
      </div>
      <div className="guess-content">
        <GuessRow letters={guess.eval} />
        <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
          <strong>{guess.user.name}</strong> guessed <strong>{guess.guess}</strong>
        </div>
      </div>
    </motion.div>
  );
}