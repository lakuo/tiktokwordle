interface EmptyGameStateProps {
  isConnected: boolean;
}

export function EmptyGameState({ isConnected }: EmptyGameStateProps) {
  return (
    <div className="empty-state">
      <div className="icon">⚡</div>
      <h3>Game starting soon...</h3>
      <p>Player guesses will appear here!</p>
    </div>
  );
}