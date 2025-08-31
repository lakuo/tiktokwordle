interface EmptyGameStateProps {
  isConnected: boolean;
}

export function EmptyGameState({ isConnected }: EmptyGameStateProps) {
  return (
    <div className="empty-state">
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
      <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Waiting for guesses...</p>
      <p>Viewers will see their guesses appear here in real-time!</p>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        {isConnected 
          ? '✅ Connected - Listening for TikTok chat messages'
          : '⏳ Connecting to server...'}
      </p>
    </div>
  );
}