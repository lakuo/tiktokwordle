import { motion } from 'framer-motion';

interface WinnerCelebrationProps {
  winnerName: string;
  targetWord: string;
  nextRoundIn?: number;
}

export function WinnerCelebration({ winnerName, targetWord, nextRoundIn }: WinnerCelebrationProps) {
  return (
    <motion.div
      className="winner-celebration"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", duration: 0.6 }}
    >
      <motion.div
        className="celebration-content"
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <motion.div
          className="celebration-emoji"
          animate={{ 
            rotate: [0, -10, 10, -10, 10, 0],
            scale: [1, 1.2, 1, 1.2, 1]
          }}
          transition={{ 
            duration: 0.8, 
            repeat: Infinity, 
            repeatDelay: 2 
          }}
        >
          🎉
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {winnerName} Wins!
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          The word was: <strong>{targetWord.toUpperCase()}</strong>
        </motion.p>
        
        {nextRoundIn && (
          <motion.p
            className="next-round-countdown"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Next round in {nextRoundIn} seconds
          </motion.p>
        )}
        
        <motion.div
          className="celebration-particles"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.span
              key={i}
              className="particle"
              animate={{
                y: [0, -50, 0],
                x: [0, Math.random() * 40 - 20, 0],
                rotate: [0, 360],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.1,
                repeat: Infinity,
                repeatDelay: 1
              }}
            >
              ✨
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}