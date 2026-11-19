export default function MatchesList({ matches, onGoDiscover }) {
  if (matches.length === 0) {
    return (
      <div className="empty">
        <div className="empty-art" aria-hidden="true"><span /><span /></div>
        <h2>No matches yet</h2>
        <p>When you and someone else both like each other, they show up here.</p>
        <button className="btn btn-primary" onClick={onGoDiscover}>Back to Discover</button>
      </div>
    );
  }
  return (
    <ul className="matches-grid">
      {matches.map((m) => (
        <li key={m.id} className="match-tile">
          <img src={m.photoUrl} alt={`${m.name}'s photo`} loading="lazy" />
          <div className="match-tile-info">
            <strong>{m.name}, {m.age}</strong>
            <span>{m.location}</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
