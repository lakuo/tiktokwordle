import React, { useEffect, useState } from 'react';
import './App.css';

type LetterState = 'correct' | 'present' | 'absent';

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

type RoundWonEvent = {
  type: "round_won";
  winner: { id: string; name: string; avatar: string | null };
  word: string;
  scoreboard: Record<string, number>;
  timestamp: number;
};

type RoundTimeoutEvent = {
  type: "round_timeout";
  word: string;
  timestamp: number;
};

type Inbound = GuessEvent | StateEvent | RoundWonEvent | RoundTimeoutEvent;

function GuessRow({ letters }: { letters: LetterEval[] }) {
  return (
    <div className="guess-row">
      {letters.map((l, i) => (
        <div key={i} className={`tile ${l.state}`}>
          {l.letter}
        </div>
      ))}
    </div>
  );
}

function WinnerModal({ visible, name, word }: { visible: boolean; name: string; word: string }) {
  if (!visible) return null;
  const isTimeout = name === "Time's up!";
  return (
    <div className="winner-modal">
      <h2>{isTimeout ? "Time's up!" : `${name} wins!`}</h2>
      <p>Word: {word}</p>
    </div>
  );
}

export default function App() {
  const [wordLength, setWordLength] = useState(5);
  const [guesses, setGuesses] = useState<GuessEvent[]>([]);
  const [scoreboard, setScoreboard] = useState<Record<string, number>>({});
  const [users, setUsers] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [lastWinner, setLastWinner] = useState<any>();
  const [winnerToast, setWinnerToast] = useState<any>(null);
  const [connected, setConnected] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [roundStartTime, setRoundStartTime] = useState<number>(Date.now());
  const [roundDuration, setRoundDuration] = useState<number>(30);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - roundStartTime) / 1000);
      const remaining = Math.max(0, roundDuration - elapsed);
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(timer);
  }, [roundStartTime, roundDuration]);

  useEffect(() => {
    const wsUrl = `ws://localhost:8080/ws`;
    let ws: WebSocket;

    const connectWebSocket = () => {
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Connected to server');
        setConnected(true);
      };

      ws.onmessage = (ev) => {
        try {
          const msg: Inbound = JSON.parse(ev.data);
          console.log('Received message:', msg);

          if (msg.type === "state") {
            setWordLength(msg.wordLength);
            setGuesses(msg.guesses ?? []);
            setScoreboard(msg.scoreboard ?? {});
            setUsers(msg.users ?? {});
            setRoundStartTime(msg.roundStartTime);
            setRoundDuration(msg.roundDuration);
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
              word: msg.word
            });
            setTimeout(() => setWinnerToast(null), 3500);
          }

          if (msg.type === "round_timeout") {
            console.log('⏰ CLIENT: Received round timeout event:', msg);
            setWinnerToast({
              name: "Time's up!",
              word: msg.word
            });
            setTimeout(() => setWinnerToast(null), 3500);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from server');
        setConnected(false);
        // Reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const recentGuesses = guesses.slice(-10);

  return (
    <div className="app">
      <div className="main-container">
        {/* Game Panel */}
        <div className="game-panel">
          <div className="header">
            <div>
              <h1 className="title">TikTok Wordle</h1>
              <p style={{ margin: '0.5rem 0', color: '#94a3b8' }}>Live Interactive Word Game</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge">Length: {wordLength}</span>
              <span className={`badge ${connected ? 'connected' : 'disconnected'}`}>
                {connected ? '🟢 Live' : '🔴 Connecting...'}
              </span>
              {connected && (
                <span className={`badge ${timeLeft <= 5 ? 'urgent' : 'timer'}`} style={{
                  backgroundColor: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                  borderColor: timeLeft <= 5 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                  color: timeLeft <= 5 ? '#ef4444' : '#3b82f6'
                }}>
                  ⏱️ {timeLeft}s
                </span>
              )}
            </div>
          </div>

          <div className="guesses-container">
            {recentGuesses.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Waiting for guesses...</p>
                <p>Viewers will see their guesses appear here in real-time!</p>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  {connected 
                    ? '✅ Connected - Listening for TikTok chat messages'
                    : '⏳ Connecting to server...'}
                </p>
              </div>
            ) : (
              recentGuesses.map((g, idx) => (
                <div key={g.timestamp + '_' + idx} className="guess-item">
                  <div className="avatar">
                    {g.user.avatar ? (
                      <img src={g.user.avatar} alt={g.user.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    ) : (
                      g.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="guess-content">
                    <GuessRow letters={g.eval} />
                    <div style={{ fontSize: '0.875rem', color: '#cbd5e1', marginTop: '0.25rem' }}>
                      <strong>{g.user.name}</strong> guessed <strong>{g.guess}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Scoreboard Panel */}
        <div className="score-panel">
          <div className="header">
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🏆 Leaderboard</h2>
              <p style={{ margin: '0.5rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>
                👥 {Object.keys(scoreboard).length} players competing
              </p>
            </div>
          </div>

          <div className="scoreboard">
            {Object.keys(scoreboard).length === 0 ? (
              <div className="empty-state" style={{ height: '150px' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
                <p>No winners yet!</p>
                <p style={{ fontSize: '0.875rem' }}>Be the first to guess correctly</p>
              </div>
            ) : (
              Object.entries(scoreboard)
                .sort((a, b) => b[1] - a[1])
                .map(([name, score], index) => {
                  const user = users[name];
                  return (
                    <div 
                      key={name} 
                      className="score-item"
                      style={{ 
                        backgroundColor: name === lastWinner?.name 
                          ? 'rgba(16, 185, 129, 0.2)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontSize: '1.25rem' }}>
                          {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={name}
                            style={{ 
                              width: '32px', 
                              height: '32px', 
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                          />
                        ) : (
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(147, 51, 234, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#a855f7'
                          }}>
                            {name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{name}</div>
                          {name === lastWinner?.name && (
                            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>⚡ Latest Winner</div>
                          )}
                        </div>
                      </div>
                      <div className="badge" style={{ 
                        backgroundColor: name === lastWinner?.name ? 'rgba(16, 185, 129, 0.2)' : undefined 
                      }}>
                        {score} {score === 1 ? 'win' : 'wins'}
                      </div>
                    </div>
                  )
                })
            )}
          </div>
        </div>
      </div>

      <WinnerModal
        visible={!!winnerToast}
        name={winnerToast?.name ?? ''}
        word={winnerToast?.word ?? ''}
      />

      <style jsx>{`
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