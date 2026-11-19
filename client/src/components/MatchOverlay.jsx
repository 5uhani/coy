import { useEffect, useRef } from 'react';
import HeartBurst from './HeartBurst.jsx';

export default function MatchOverlay({ match, me, onKeepSwiping, onViewMatches }) {
  const primary = useRef(null);

  useEffect(() => {
    primary.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onKeepSwiping();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onKeepSwiping]);

  return (
    <div className="match" role="dialog" aria-modal="true" aria-labelledby="match-title">
      <HeartBurst />
      <div className="match-photos">
        <img className="match-photo match-photo-me" src={me?.photoUrl} alt="You" />
        <img className="match-photo match-photo-them" src={match.photoUrl} alt={match.name} />
        <span className="match-heart" aria-hidden="true">♥</span>
      </div>
      <h2 id="match-title" className="match-title">It’s a match!</h2>
      <p className="match-sub">You and {match.name} liked each other.</p>
      <div className="match-actions">
        <button ref={primary} className="btn btn-primary" onClick={onViewMatches}>See your matches</button>
        <button className="btn btn-ghost" onClick={onKeepSwiping}>Keep swiping</button>
      </div>
    </div>
  );
}
