const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const HeartIcon = ({ filled, ...p }) => (
  <svg {...base} {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20.5s-7.5-4.6-9.2-9.3C1.6 7.7 3.6 4.5 7 4.5c2 0 3.5 1.1 5 3 1.5-1.9 3-3 5-3 3.4 0 5.4 3.2 4.2 6.7-1.7 4.7-9.2 9.3-9.2 9.3z" />
  </svg>
);
export const CloseIcon = (p) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const PinIcon = (p) => (<svg {...base} {...p}><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></svg>);
export const HomeIcon = (p) => (<svg {...base} {...p}><path d="M4 11l8-6.5 8 6.5v8.5a1 1 0 01-1 1h-4.5v-6h-5v6H5a1 1 0 01-1-1z" /></svg>);
export const DiscoverIcon = (p) => (<svg {...base} {...p}><rect x="5" y="3.5" width="14" height="17" rx="3.5" /><path d="M9 15.5c1 .9 2 1.3 3 1.3s2-.4 3-1.3" /><circle cx="9.5" cy="10" r=".6" fill="currentColor" /><circle cx="14.5" cy="10" r=".6" fill="currentColor" /></svg>);
