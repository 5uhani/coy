import { useState } from 'react';
import BottomNav from './components/BottomNav.jsx';
import HomePage from './pages/HomePage.jsx';
import DiscoverPage from './pages/DiscoverPage.jsx';

export default function App() {
  const [tab, setTab] = useState('discover');
  return (
    <div className="app">
      {/* Both stay mounted so Discover keeps its state when you switch tabs. */}
      <div className="tab-panel" hidden={tab !== 'home'}><HomePage /></div>
      <div className="tab-panel" hidden={tab !== 'discover'}><DiscoverPage active={tab === 'discover'} /></div>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
