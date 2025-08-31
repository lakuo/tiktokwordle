import { motion } from 'framer-motion';

interface NoWinnerStateProps {
  timeRemaining: number;
  targetWord?: string;
  nextRoundIn?: number;
}

export function NoWinnerState({ timeRemaining, targetWord, nextRoundIn }: NoWinnerStateProps) {
  return (
    <motion.div
      className="no-winner-state"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="no-winner-content"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <motion.div
          className="no-winner-emoji"
          animate={{ 
            rotate: [0, -5, 5, -5, 5, 0]
          }}
          transition={{ 
            duration: 1, 
            repeat: Infinity, 
            repeatDelay: 3 
          }}
        >
          😅
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          No Winner This Round!
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {targetWord ? (
            <>The word was: <strong>{targetWord.toUpperCase()}</strong></>
          ) : (
            'Better luck next time!'
          )}
        </motion.p>
        
        <motion.p
          className="next-round-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {nextRoundIn ? `Next round in ${nextRoundIn} seconds` : 'Next round starting soon...'}
        </motion.p>
      </motion.div>
    </motion.div>
  );
}