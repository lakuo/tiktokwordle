import React from 'react';
import './App.css';
import { GamePanel } from './components/gameplay/GamePanel';
import { ScorePanel } from './components/scoreboard/ScorePanel';
import { WinnerModal } from './components/modals/WinnerModal';
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

  const timeRemaining = useTimer(roundStartTime, roundDuration);
  const displayedGuesses = guesses.slice(-10);

  return (
    <div className="app">
      <div className="main-container">
        <GamePanel 
          wordLength={wordLength}
          isConnected={isConnected}
          timeRemaining={timeRemaining}
          displayedGuesses={displayedGuesses}
        />
        
        <ScorePanel 
          scoreboard={scoreboard}
          users={users}
          lastWinner={lastWinner}
        />
      </div>

      <WinnerModal
        visible={!!winnerToast}
        winnerName={winnerToast?.name ?? ''}
        targetWord={winnerToast?.word ?? ''}
      />

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