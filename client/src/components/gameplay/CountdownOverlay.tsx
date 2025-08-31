import { motion } from 'framer-motion';

interface CountdownOverlayProps {
  timeRemaining: number;
}

export function CountdownOverlay({ timeRemaining }: CountdownOverlayProps) {
  const countdownNumber = Math.max(1, Math.ceil(timeRemaining));
  const progressDuration = timeRemaining > 0 ? timeRemaining : 1;
  
  return (
    <motion.div
      className="countdown-overlay"
      initial={{ opacity: 0, scale: 2 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
    >
      <motion.div
        className="countdown-circle"
        initial={{ rotate: 0, scale: 0.8 }}
        animate={{ 
          rotate: 360, 
          scale: [0.8, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 1, ease: "easeInOut" },
          scale: { duration: 0.3, times: [0, 0.5, 1] }
        }}
        key={countdownNumber}
      >
        <motion.span
          className="countdown-number"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 2 }}
          transition={{ duration: 0.2 }}
          key={countdownNumber}
        >
          {countdownNumber}
        </motion.span>
      </motion.div>
      
      <motion.p
        className="countdown-text"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Next round starting...
      </motion.p>
      
      <motion.div
        className="countdown-progress"
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: progressDuration, ease: "linear" }}
        key={countdownNumber}
      />
    </motion.div>
  );
}