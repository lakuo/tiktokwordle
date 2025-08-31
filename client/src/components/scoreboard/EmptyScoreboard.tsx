export function EmptyScoreboard() {
  return (
    <div className="empty-state" style={{ height: '180px' }}>
      <div className="icon">🏆</div>
      <h3>No winners yet!</h3>
      <p>Be the first to guess correctly</p>
    </div>
  );
}