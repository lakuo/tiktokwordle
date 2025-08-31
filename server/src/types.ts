export type LetterState = "correct" | "present" | "absent";

export interface LetterEval {
  letter: string;
  state: LetterState;
}

export interface GuessEvent {
  type: "guess";
  guess: string;
  eval: LetterEval[];
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
  timestamp: number;
}

export interface StateEvent {
  type: "state";
  roundActive: boolean;
  wordLength: number;
  guesses: GuessEvent[];
  scoreboard: Record<string, number>;
  lastWinner?: {
    id: string;
    name: string;
    avatar: string | null;
    word: string;
    at: number;
  };
}

export interface RoundWonEvent {
  type: "round_won";
  winner: {
    id: string;
    name: string;
    avatar: string | null;
  };
  word: string;
  scoreboard: Record<string, number>;
  timestamp: number;
}

export type OutboundMessage = GuessEvent | StateEvent | RoundWonEvent;
