import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

// Owns all Discover data. The client only ever holds profiles the server sent
// (public fields) and matches the server confirmed. It has no knowledge of who
// liked the user, so there is nothing to leak.
export function useDiscover() {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [queue, setQueue] = useState([]);
  const [matches, setMatches] = useState([]);
  const [me, setMe] = useState(null);
  const [matchEvent, setMatchEvent] = useState(null);
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [feed, matchList, user] = await Promise.all([api.getFeed(), api.getMatches(), api.getMe()]);
      setQueue(feed);
      setMatches(matchList);
      setMe(user);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const swipe = useCallback(async (profile, action) => {
    setQueue((q) => q.filter((p) => p.id !== profile.id)); // next card appears instantly
    try {
      const res = await api.swipe(profile.id, action);
      if (res.matched) {
        setMatches((m) => (m.some((x) => x.id === res.match.id) ? m : [res.match, ...m]));
        setMatchEvent(res.match);
      }
    } catch (err) {
      if (err.status === 409) return; // already recorded on the server
      setQueue((q) => [profile, ...q]); // put the card back, it was not saved
      setToast(err.status === 0 ? "Can't reach the server. Try that swipe again." : err.message);
    }
  }, []);

  return {
    status, queue, matches, me, matchEvent, toast,
    swipe, reload: load,
    dismissMatch: () => setMatchEvent(null),
    dismissToast: () => setToast(null),
  };
}
