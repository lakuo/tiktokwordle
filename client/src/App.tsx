import React, { useState, useEffect } from 'react';
import './App.css';
import { GamePanel } from './components/gameplay/GamePanel';
import { ScorePanel } from './components/scoreboard/ScorePanel';
import { useWebSocket } from './hooks/useWebSocket';
import { useTimer } from './hooks/useTimer';

export default function App() {
  const {
    isConnected,
    guesses,
    scoreboard,
    users,
    lastWinner,
    wordLength,
    roundStartTime,
    roundDuration,
    winnerToast
  } = useWebSocket();

  const gameTimeRemaining = useTimer(roundStartTime, roundDuration);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);

  // Determine the actual time to display
  const timeRemaining = nextRoundCountdown !== null ? nextRoundCountdown : gameTimeRemaining;
  
  // Check if game has ended and start countdown
  useEffect(() => {
    if (!winnerToast) {
      setNextRoundCountdown(null);
      return;
    }
    
    // Only start countdown if not already counting
    if (nextRoundCountdown !== null) return;
    
    // Start 10-second countdown when round ends
    setNextRoundCountdown(10);
    
    const countdownTimer = setInterval(() => {
      setNextRoundCountdown(prevCount => {
        if (prevCount === null || prevCount <= 1) {
          clearInterval(countdownTimer);
          return null;
        }
        return prevCount - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownTimer);
  }, [winnerToast]);

  const displayedGuesses = guesses.slice(-10).reverse();

  return (
    <div className="app">
      <div className="main-container">
        <GamePanel 
          wordLength={wordLength}
          isConnected={isConnected}
          timeRemaining={timeRemaining}
          displayedGuesses={displayedGuesses}
          winnerToast={winnerToast}
          roundStartTime={roundStartTime}
          roundDuration={roundDuration}
          gameState={
            winnerToast && winnerToast.name !== "Time's up!" ? 'ended_with_winner' : 
            winnerToast && winnerToast.name === "Time's up!" ? 'ended_no_winner' : 
            gameTimeRemaining <= 0 && !winnerToast ? 'ended_no_winner' :
            gameTimeRemaining > 30 ? 'waiting' : 'playing'
          }
          targetWord={winnerToast?.word}
          nextRoundIn={nextRoundCountdown}
        />
        
        <ScorePanel 
          scoreboard={scoreboard}
          users={users}
          lastWinner={lastWinner}
        />
      </div>

      <style>{`
        .connected {
          background: rgba(16, 185, 129, 0.2) !important;
          border-color: rgba(16, 185, 129, 0.3) !important;
          color: #10b981 !important;
        }
        .disconnected {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: #ef4444 !important;
        }
      `}</style>
    </div>
  );
}