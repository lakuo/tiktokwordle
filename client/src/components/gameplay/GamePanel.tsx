import { motion, AnimatePresence } from 'framer-motion';
import { GuessMessage } from '../../types';
import { GameHeader } from './GameHeader';
import { EmptyGameState } from './EmptyGameState';
import { GuessItem } from './GuessItem';
import { WinnerCelebration } from './WinnerCelebration';
import { NoWinnerState } from './NoWinnerState';

interface GamePanelProps {
  wordLength: number;
  isConnected: boolean;
  timeRemaining: number;
  displayedGuesses: GuessMessage[];
  winnerToast?: { name: string; word: string } | null;
  roundStartTime?: number;
  roundDuration?: number;
  gameState?: 'playing' | 'ended_no_winner' | 'ended_with_winner' | 'waiting';
  targetWord?: string;
  nextRoundIn?: number;
}

export function GamePanel({ wordLength, isConnected, timeRemaining, displayedGuesses, winnerToast, roundStartTime, roundDuration, gameState, targetWord, nextRoundIn }: GamePanelProps) {

  return (
    <motion.div 
      className="game-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GameHeader 
        wordLength={wordLength}
        isConnected={isConnected}
        timeRemaining={timeRemaining}
        gameState={gameState}
      />

      <div className="guesses-container">
        <AnimatePresence mode="wait">
          {gameState === 'ended_with_winner' && winnerToast && winnerToast.name && winnerToast.name !== "Time's up!" ? (
            <WinnerCelebration 
              key="winner-celebration"
              winnerName={winnerToast.name} 
              targetWord={winnerToast.word}
              nextRoundIn={nextRoundIn}
            />
          ) : gameState === 'ended_no_winner' ? (
            <NoWinnerState 
              key="no-winner-state"
              timeRemaining={timeRemaining}
              targetWord={winnerToast?.word || targetWord}
              nextRoundIn={nextRoundIn}
            />
          ) : (
            <motion.div
              key="guesses-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {displayedGuesses.length === 0 ? (
                <EmptyGameState isConnected={isConnected} />
              ) : (
                <AnimatePresence>
                  {displayedGuesses.map((guess, index) => (
                    <GuessItem key={guess.timestamp + '_' + index} guess={guess} index={index} />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}