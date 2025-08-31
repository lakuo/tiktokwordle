import { useEffect, useState } from 'react';

export function useTimer(roundStartTime: number, roundDuration: number) {
  const [timeRemaining, setTimeRemaining] = useState<number>(30);

  useEffect(() => {
    if (!roundStartTime || !roundDuration) {
      return;
    }

    const updateTimer = () => {
      const elapsedSeconds = Math.floor((Date.now() - roundStartTime) / 1000);
      const remainingTime = Math.max(0, roundDuration - elapsedSeconds);
      setTimeRemaining(remainingTime);
    };

    updateTimer(); // Initial update
    const timer = setInterval(updateTimer, 100);

    return () => clearInterval(timer);
  }, [roundStartTime, roundDuration]);

  return timeRemaining;
}