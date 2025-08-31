export type LetterState = 'correct' | 'present' | 'absent';

export type LetterEvaluation = { 
  letter: string; 
  state: LetterState; 
};

export type GuessMessage = {
  type: "guess";
  guess: string;
  eval: LetterEvaluation[];
  user: { id: string; name: string; avatar: string | null };
  timestamp: number;
};

export type StateMessage = {
  type: "state";
  roundActive: boolean;
  wordLength: number;
  guesses: GuessMessage[];
  scoreboard: Record<string, number>;
  users: Record<string, { name: string; avatar: string | null }>;
  roundStartTime: number;
  roundDuration: number;
  lastWinner?: {
    id: string;
    name: string;
    avatar: string | null;
    word: string;
    at: number;
  };
};

export type RoundWonMessage = {
  type: "round_won";
  winner: { id: string; name: string; avatar: string | null };
  word: string;
  scoreboard: Record<string, number>;
  timestamp: number;
};

export type RoundTimeoutMessage = {
  type: "round_timeout";
  word: string;
  timestamp: number;
};

export type InboundMessage = GuessMessage | StateMessage | RoundWonMessage | RoundTimeoutMessage;

export interface Player {
  id: string;
  name: string;
  avatar: string | null;
}

export interface Winner extends Player {
  word: string;
  at: number;
}