import React, { useEffect, useMemo, useRef, useState } from "react";
import { LetterState } from "../../server/src/types";
import { GuessRow } from "./components/GuessRow";
import { Scoreboard } from "./components/ScoreBoard";
import { WinnerModal } from "./components/WinnerModal";

type LetterEval = { letter: string; state: LetterState };

type GuessEvent = {
  type: "guess";
  guess: string;
  eval: LetterEval[];
  user: { id: string; name: string; avatar: string | null };
  timestamp: number;
};

type StateEvent = {
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
};

type RoundWonEvent = {
  type: "round_won";
  winner: { id: string; name: string; avatar: string | null };
  word: string;
  scoreboard: Record<string, number>;
  timestamp: number;
};

type Inbound = GuessEvent | StateEvent | RoundWonEvent;

export default function App() {
  const [wordLength, setWordLength] = useState(5);
  const [guesses, setGuesses] = useState<GuessEvent[]>([]);
  const [scoreboard, setScoreboard] = useState<Record<string, number>>({});
  const [lastWinner, setLastWinner] = useState<
    { id: string; name: string; avatar: string | null; word: string; at: number } | undefined
  >(undefined);
  const [winnerToast, setWinnerToast] = useState<{
    name: string;
    avatar?: string | null;
    word: string;
  } | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const loc = window.location;
    const proto = loc.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${proto}://${loc.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = ev => {
      const msg: Inbound = JSON.parse(ev.data);

      if (msg.type === "state") {
        setWordLength(msg.wordLength);
        setGuesses(msg.guesses ?? []);
        setScoreboard(msg.scoreboard ?? {});
        if (msg.lastWinner) setLastWinner(msg.lastWinner);
      }

      if (msg.type === "guess") {
        setGuesses(g => [...g, msg]);
      }

      if (msg.type === "round_won") {
        setScoreboard(msg.scoreboard);
        setLastWinner({
          id: msg.winner.id,
          name: msg.winner.name,
          avatar: msg.winner.avatar,
          word: msg.word,
          at: msg.timestamp
        });
        setWinnerToast({
          name: msg.winner.name,
          avatar: msg.winner.avatar,
          word: msg.word
        });
        // Hide toast after 3.5s
        setTimeout(() => setWinnerToast(null), 3500);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const list = useMemo(() => guesses.slice(-60), [guesses]);

  return (
    <div className="app">
      <div className="left">
        <div className="header">
          <h1 className="h1">TikTok Wordle</h1>
          <div className="small">Word length: {wordLength}</div>
        </div>

        <div className="guesses">
          {list.map((g, idx) => (
            <div key={g.timestamp + "_" + idx}>
              <GuessRow letters={g.eval} />
              <div className="guess-meta">
                {g.user.name} guessed <strong>{g.guess}</strong>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="right">
        <div className="header">
          <h2 className="h1">Scoreboard</h2>
          <div className="small">{Object.keys(scoreboard).length} players</div>
        </div>
        <Scoreboard
          scores={scoreboard}
          lastWinnerName={lastWinner?.name}
        />
      </div>

      <WinnerModal
        visible={!!winnerToast}
        name={winnerToast?.name ?? ""}
        avatar={winnerToast?.avatar}
        word={winnerToast?.word ?? ""}
      />
    </div>
  );
}
