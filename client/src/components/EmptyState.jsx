export default function EmptyState({ matchCount, onViewMatches }) {
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden="true"><span /><span /><span /></div>
      <h2>You’ve seen everyone for now</h2>
      <p>Every profile has a like or a pass. Your matches are waiting below.</p>
      {matchCount > 0 && (
        <button className="btn btn-primary" onClick={onViewMatches}>
          See your {matchCount === 1 ? 'match' : `${matchCount} matches`}
        </button>
      )}
    </div>
  );
}
