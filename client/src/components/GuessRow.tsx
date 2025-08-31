import React from "react";
import { LetterState } from "../../../server/src/types";

export function GuessRow({
  letters
}: {
  letters: { letter: string; state: LetterState }[];
}) {
  return (
    <div className="guess">
      {letters.map((l, i) => (
        <div key={i} className={`tile ${l.state}`}>
          {l.letter}
        </div>
      ))}
    </div>
  );
}
