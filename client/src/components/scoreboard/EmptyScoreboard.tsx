export function EmptyScoreboard() {
  return (
    <div className="empty-state" style={{ height: '150px' }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
      <p>No winners yet!</p>
      <p style={{ fontSize: '0.875rem' }}>Be the first to guess correctly</p>
    </div>
  );
}