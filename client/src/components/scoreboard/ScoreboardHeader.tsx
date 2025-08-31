interface ScoreboardHeaderProps {
  playerCount: number;
}

export function ScoreboardHeader({ playerCount }: ScoreboardHeaderProps) {
  return (
    <div className="header">
      <div>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>🏆 Leaderboard</h2>
        <p style={{ margin: '0.5rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>
          👥 {playerCount} players competing
        </p>
      </div>
    </div>
  );
}