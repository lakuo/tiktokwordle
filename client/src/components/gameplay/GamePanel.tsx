import { GuessMessage } from '../../types';
import { GameHeader } from './GameHeader';
import { EmptyGameState } from './EmptyGameState';
import { GuessItem } from './GuessItem';

interface GamePanelProps {
  wordLength: number;
  isConnected: boolean;
  timeRemaining: number;
  displayedGuesses: GuessMessage[];
}

export function GamePanel({ wordLength, isConnected, timeRemaining, displayedGuesses }: GamePanelProps) {
  return (
    <div className="game-panel">
      <GameHeader 
        wordLength={wordLength}
        isConnected={isConnected}
        timeRemaining={timeRemaining}
      />

      <div className="guesses-container">
        {displayedGuesses.length === 0 ? (
          <EmptyGameState isConnected={isConnected} />
        ) : (
          displayedGuesses.map((guess, index) => (
            <GuessItem key={guess.timestamp + '_' + index} guess={guess} index={index} />
          ))
        )}
      </div>
    </div>
  );
}