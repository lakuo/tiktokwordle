import { motion, AnimatePresence } from 'framer-motion';
import { GuessMessage, Winner } from '../../types';
import { GameHeader } from './GameHeader';
import { EmptyGameState } from './EmptyGameState';
import { GuessItem } from './GuessItem';
import { WinnerCelebration } from './WinnerCelebration';
import { NoWinnerState } from './NoWinnerState';
import { ScoreItem } from '../scoreboard/ScoreItem';
import { Badge } from '../shared/Badge';

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
  scoreboard: Record<string, number>;
  users: Record<string, { name: string; avatar: string | null }>;
  lastWinner?: Winner;
}

export function GamePanel({ wordLength, isConnected, timeRemaining, displayedGuesses, winnerToast, roundStartTime, roundDuration, gameState, targetWord, nextRoundIn, scoreboard, users, lastWinner }: GamePanelProps) {
  const playerCount = Object.keys(scoreboard).length;
  const sortedPlayers = Object.entries(scoreboard).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const getTimerDisplay = () => {
    if (!isConnected) return null;
    
    if (gameState === 'waiting') {
      return (
        <Badge variant="timer">
          ⏳ Next: {timeRemaining}s
        </Badge>
      );
    }
    
    if (gameState === 'ended_with_winner' || gameState === 'ended_no_winner') {
      return (
        <Badge variant="timer">
          🔄 Next: {timeRemaining}s
        </Badge>
      );
    }
    
    return (
      <Badge 
        variant={timeRemaining <= 5 ? 'urgent' : 'timer'}
        style={{
          backgroundColor: timeRemaining <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
          borderColor: timeRemaining <= 5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
          color: timeRemaining <= 5 ? '#ef4444' : '#3b82f6'
        }}
      >
        ⏱️ {timeRemaining}s
      </Badge>
    );
  };

  return (
    <motion.div 
      className="iphone-game-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with title on left, leaderboard on right */}
      <div className="header-row">
        <div className="title-section">
          <h1 className="game-title">Wordle</h1>
          <div className="game-instructions">
            <div>🟨 Wrong spot</div>
            <div>🟩 Right spot</div>
            <div>⬛ Not in word</div>
          </div>
        </div>
        
        <div className="fixed-leaderboard">
          <div className="leaderboard-title">Leaderboard</div>
          <div className="ranking-list">
            {Array.from({ length: 5 }, (_, index) => {
              const playerData = sortedPlayers[index];
              if (playerData) {
                const [playerName, winCount] = playerData;
                return (
                  <div key={playerName} className="rank-item">
                    <span className="rank-number">{index + 1}</span>
                    <div className="rank-avatar">
                      {users[playerName]?.avatar ? (
                        <img src={users[playerName].avatar} alt={playerName} />
                      ) : (
                        playerName.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="rank-name">{users[playerName]?.name || playerName}</span>
                    <span className="rank-score">{winCount}</span>
                  </div>
                );
              }
              return (
                <div key={`empty-${index}`} className="rank-item empty">
                  <span className="rank-number">{index + 1}</span>
                  <div className="rank-avatar empty"></div>
                  <span className="rank-name">—</span>
                  <span className="rank-score">—</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed height guesses section with timer in top right */}
      <div className="fixed-guesses-container">
        <div className="guesses-header">
          <div className="timer-display">
            {getTimerDisplay()}
          </div>
        </div>
        
        <div className="guesses-scroll-area">
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
      </div>
    </motion.div>
  );
}