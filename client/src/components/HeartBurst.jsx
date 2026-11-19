import { useMemo } from 'react';

const COLORS = ['#ff4d6d', '#ffb84d', '#ff8aa0', '#d9d3f7', '#ffffff'];
const rand = (min, max) => min + Math.random() * (max - min);

// Decorative only: confetti burst plus hearts drifting up the screen.
export default function HeartBurst() {
  const hearts = useMemo(() => Array.from({ length: 26 }, (_, i) => ({
    id: i, left: rand(0, 100), size: rand(14, 40), delay: rand(0.4, 2.2), duration: rand(3.4, 6),
    drift: rand(-70, 70), color: COLORS[i % COLORS.length], glyph: i % 6 === 0 ? '\u2726' : '\u2665',
  })), []);
  const confetti = useMemo(() => Array.from({ length: 36 }, (_, i) => {
    const angle = rand(0, Math.PI * 2); const dist = rand(120, 300);
    return { id: i, dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist * 0.8 - 40, rot: rand(-540, 540), delay: 0.55 + rand(0, 0.15), color: COLORS[i % COLORS.length] };
  }), []);

  return (
    <>
      <div className="confetti-layer" aria-hidden="true">
        {confetti.map((c) => (
          <span key={c.id} className="confetti" style={{ background: c.color, '--dx': `${c.dx}px`, '--dy': `${c.dy}px`, '--rot': `${c.rot}deg`, '--delay': `${c.delay}s` }} />
        ))}
      </div>
      <div className="hearts" aria-hidden="true">
        {hearts.map((h) => (
          <span key={h.id} className="float-heart" style={{ left: `${h.left}%`, fontSize: h.size, color: h.color, animationDelay: `${h.delay}s`, animationDuration: `${h.duration}s`, '--drift': `${h.drift}px` }}>{h.glyph}</span>
        ))}
      </div>
    </>
  );
}
