import React from 'react';
import { tileVariants } from '../lib/styles';

type LetterState = 'correct' | 'present' | 'absent';

export function GuessRow({
  letters
}: {
  letters: { letter: string; state: LetterState }[];
}) {
  return (
    <div className="flex gap-2 justify-start">
      {letters.map((l, i) => (
        <div 
          key={i} 
          className={tileVariants({ state: l.state })}
          style={{
            boxShadow: l.state === 'correct' 
              ? '0 0 20px rgba(16, 185, 129, 0.3)'
              : l.state === 'present'
              ? '0 0 20px rgba(245, 158, 11, 0.3)'
              : '0 0 10px rgba(71, 85, 105, 0.2)'
          }}
        >
          {l.letter}
        </div>
      ))}
    </div>
  );
}
