import { GuessMessage } from '../../types';
import { GuessRow } from './GuessRow';

interface GuessItemProps {
  guess: GuessMessage;
  index: number;
}

export function GuessItem({ guess, index }: GuessItemProps) {
  return (
    <div className="guess-item">
      <div className="avatar">
        {guess.user.avatar ? (
          <img src={guess.user.avatar} alt={guess.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
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
    </div>
  );
}