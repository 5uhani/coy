import { useCallback, useEffect, useState } from 'react';
import SwipeCard, { CardInfo } from './SwipeCard.jsx';
import { CloseIcon, HeartIcon } from './Icons.jsx';

// Shows one card at a time (the next one waits underneath), handles the Like /
// Pass buttons, arrow keys, and hands finished swipes to `onSwipe`.
export default function SwipeDeck({ queue, onSwipe, keyboardEnabled }) {
  const [exitDir, setExitDir] = useState(null);
  const top = queue[0];
  const next = queue[1];

  const decide = useCallback((dir) => setExitDir((d) => d ?? dir), []);
  const exited = useCallback((dir) => { setExitDir(null); onSwipe(top, dir); }, [onSwipe, top]);

  useEffect(() => {
    if (!keyboardEnabled) return undefined;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') decide('like');
      if (e.key === 'ArrowLeft') decide('pass');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [keyboardEnabled, decide]);

  return (
    <>
      <div className="deck">
        {next && (
          <article className={`card card-next ${exitDir ? 'is-promoting' : ''}`} aria-hidden="true">
            <img className="card-photo" src={next.photoUrl} alt="" draggable={false} />
            <div className="card-shade" />
            <CardInfo profile={next} />
          </article>
        )}
        <SwipeCard key={top.id} profile={top} exitDir={exitDir} onDecide={decide} onExited={exited} />
      </div>
      <div className="actions">
        <button className="action action-pass" onClick={() => decide('pass')} disabled={Boolean(exitDir)} aria-label={`Pass on ${top.name}`}>
          <CloseIcon width={28} height={28} />
        </button>
        <button className="action action-like" onClick={() => decide('like')} disabled={Boolean(exitDir)} aria-label={`Like ${top.name}`}>
          <HeartIcon width={32} height={32} filled />
        </button>
      </div>
      <p className="hint">Press <kbd>←</kbd> to pass, <kbd>→</kbd> to like</p>
    </>
  );
}
