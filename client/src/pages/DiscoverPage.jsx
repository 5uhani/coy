import { useState } from 'react';
import { useDiscover } from '../hooks/useDiscover.js';
import SwipeDeck from '../components/SwipeDeck.jsx';
import EmptyState from '../components/EmptyState.jsx';
import MatchesList from '../components/MatchesList.jsx';
import MatchOverlay from '../components/MatchOverlay.jsx';
import Toast from '../components/Toast.jsx';

export default function DiscoverPage({ active }) {
  const d = useDiscover();
  const [view, setView] = useState('cards'); // cards | matches

  const goMatches = () => { d.dismissMatch(); setView('matches'); };

  let body;
  if (view === 'matches') {
    body = <MatchesList matches={d.matches} onGoDiscover={() => setView('cards')} />;
  } else if (d.status === 'loading') {
    body = <div className="deck"><div className="card card-skeleton" aria-label="Loading profiles" /></div>;
  } else if (d.status === 'error') {
    body = (
      <div className="empty">
        <h2>Couldn’t load profiles</h2>
        <p>Check that the server is running on port 4000, then try again.</p>
        <button className="btn btn-primary" onClick={d.reload}>Try again</button>
      </div>
    );
  } else if (d.queue.length === 0) {
    body = <EmptyState matchCount={d.matches.length} onViewMatches={() => setView('matches')} />;
  } else {
    body = <SwipeDeck queue={d.queue} onSwipe={d.swipe} keyboardEnabled={active && !d.matchEvent} />;
  }

  return (
    <main className="page discover" aria-label="Discover">
      <header className="topbar">
        <span className="wordmark">coy</span>
        <div className="segmented" role="tablist" aria-label="Discover views">
          <button role="tab" aria-selected={view === 'cards'} onClick={() => setView('cards')}>Cards</button>
          <button role="tab" aria-selected={view === 'matches'} onClick={() => setView('matches')}>
            Matches{d.matches.length > 0 && <span className="count">{d.matches.length}</span>}
          </button>
        </div>
      </header>
      {body}
      {d.matchEvent && <MatchOverlay match={d.matchEvent} me={d.me} onKeepSwiping={d.dismissMatch} onViewMatches={goMatches} />}
      <Toast message={d.toast} onDone={d.dismissToast} />
    </main>
  );
}
