interface EmptyGameStateProps {
  isConnected: boolean;
}

export function EmptyGameState({ isConnected }: EmptyGameStateProps) {
  return (
    <div className="empty-state">
      <div className="icon">⚡</div>
      <h3>Waiting for guesses...</h3>
      <p>Viewers will see their guesses appear here in real-time!</p>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        {isConnected 
          ? '✅ Connected - Listening for TikTok chat messages'
          : '⏳ Connecting to server...'}
      </p>
    </div>
  );
}