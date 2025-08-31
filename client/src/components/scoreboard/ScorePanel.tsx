import { Winner } from '../../types';
import { ScoreboardHeader } from './ScoreboardHeader';
import { EmptyScoreboard } from './EmptyScoreboard';
import { ScoreItem } from './ScoreItem';

interface ScorePanelProps {
  scoreboard: Record<string, number>;
  users: Record<string, { name: string; avatar: string | null }>;
  lastWinner?: Winner;
}

export function ScorePanel({ scoreboard, users, lastWinner }: ScorePanelProps) {
  const playerCount = Object.keys(scoreboard).length;
  const sortedPlayers = Object.entries(scoreboard).sort((a, b) => b[1] - a[1]);

  return (
    <div className="score-panel">
      <ScoreboardHeader playerCount={playerCount} />

      <div className="scoreboard">
        {playerCount === 0 ? (
          <EmptyScoreboard />
        ) : (
          sortedPlayers.map(([playerName, winCount], playerIndex) => (
            <ScoreItem
              key={playerName}
              playerName={playerName}
              winCount={winCount}
              playerIndex={playerIndex}
              playerData={users[playerName]}
              lastWinner={lastWinner}
            />
          ))
        )}
      </div>
    </div>
  );
}