import { DiscoverIcon, HomeIcon } from './Icons.jsx';

const TABS = [
  { id: 'home', label: 'Home', Icon: HomeIcon },
  { id: 'discover', label: 'Discover', Icon: DiscoverIcon },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className="nav-tab" aria-current={active === id ? 'page' : undefined} onClick={() => onChange(id)}>
          <Icon />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
