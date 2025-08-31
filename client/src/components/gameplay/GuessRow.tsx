import { LetterEvaluation } from '../../types';

interface GuessRowProps {
  letters: LetterEvaluation[];
}

export function GuessRow({ letters }: GuessRowProps) {
  return (
    <div className="guess-row">
      {letters.map((letterEval, index) => (
        <div key={index} className={`tile ${letterEval.state}`}>
          {letterEval.letter}
        </div>
      ))}
    </div>
  );
}