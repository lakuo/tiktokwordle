import { useEffect, useState } from 'react';
import { InboundMessage, GuessMessage, StateMessage } from '../types';

interface WebSocketState {
  isConnected: boolean;
  guesses: GuessMessage[];
  scoreboard: Record<string, number>;
  users: Record<string, { name: string; avatar: string | null }>;
  lastWinner: any;
  wordLength: number;
  roundStartTime: number;
  roundDuration: number;
}

interface UseWebSocketReturn extends WebSocketState {
  winnerToast: any;
  setGuesses: React.Dispatch<React.SetStateAction<GuessMessage[]>>;
  setScoreboard: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  setUsers: React.Dispatch<React.SetStateAction<Record<string, { name: string; avatar: string | null }>>>;
  setLastWinner: React.Dispatch<React.SetStateAction<any>>;
  setWordLength: React.Dispatch<React.SetStateAction<number>>;
  setRoundStartTime: React.Dispatch<React.SetStateAction<number>>;
  setRoundDuration: React.Dispatch<React.SetStateAction<number>>;
}

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [guesses, setGuesses] = useState<GuessMessage[]>([]);
  const [scoreboard, setScoreboard] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [lastWinner, setLastWinner] = useState<any>();
  const [winnerToast, setWinnerToast] = useState<any>(null);
  const [wordLength, setWordLength] = useState(5);
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());
  const [roundDuration, setRoundDuration] = useState<number>(30);

  useEffect(() => {
    const websocketUrl = `ws://localhost:8080/ws`;
    let websocket: WebSocket;

    const establishWebSocketConnection = () => {
      websocket = new WebSocket(websocketUrl);
      
      websocket.onopen = () => {
        setIsConnected(true);
      };

      websocket.onmessage = (event) => {
        try {
          const message: InboundMessage = JSON.parse(event.data);

          if (message.type === "state") {
            setWordLength(message.wordLength);
            setGuesses(message.guesses ?? []);
            setScoreboard(message.scoreboard ?? {});
            setUsers(message.users ?? {});
            setRoundStartTime(message.roundStartTime);
            setRoundDuration(message.roundDuration);
            if (message.lastWinner) setLastWinner(message.lastWinner);
          }

          if (message.type === "guess") {
            setGuesses(currentGuesses => [...currentGuesses, message]);
          }

          if (message.type === "round_won") {
            setScoreboard(message.scoreboard);
            setLastWinner({
              id: message.winner.id,
              name: message.winner.name,
              avatar: message.winner.avatar,
              word: message.word,
              at: message.timestamp
            });
            setWinnerToast({
              name: message.winner.name,
              word: message.word
            });
            setTimeout(() => setWinnerToast(null), 10000);
          }

          if (message.type === "round_timeout") {
            setWinnerToast({
              name: "Time's up!",
              word: message.word
            });
            setTimeout(() => setWinnerToast(null), 10000);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      websocket.onclose = () => {
        setIsConnected(false);
        setTimeout(establishWebSocketConnection, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    establishWebSocketConnection();

    return () => {
      if (websocket) websocket.close();
    };
  }, []);

  return {
    isConnected,
    guesses,
    scoreboard,
    users,
    lastWinner,
    wordLength,
    roundStartTime,
    roundDuration,
    winnerToast,
    setGuesses,
    setScoreboard,
    setUsers,
    setLastWinner,
    setWordLength,
    setRoundStartTime,
    setRoundDuration
  };
}