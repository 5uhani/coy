import { useEffect, useRef } from 'react';
import { useSwipeGesture } from '../hooks/useSwipeGesture.js';
import { PinIcon } from './Icons.jsx';

const EXIT_MS = 320;
const clamp = (n) => Math.max(0, Math.min(1, n));

export default function SwipeCard({ profile, exitDir, onDecide, onExited }) {
  const { offset, dragging, bind } = useSwipeGesture({ disabled: Boolean(exitDir), onDecide });

  // Fires once the fly-out animation has had time to finish (also covers
  // reduced-motion, where no transition event would ever fire).
  const done = useRef(onExited);
  done.current = onExited;
  useEffect(() => {
    if (!exitDir) return undefined;
    const t = setTimeout(() => done.current(exitDir), EXIT_MS);
    return () => clearTimeout(t);
  }, [exitDir]);

  let transform = 'translate3d(0,0,0) rotate(0deg)';
  let transition = 'transform .38s cubic-bezier(.2,.9,.3,1.25)';
  if (exitDir) {
    const sign = exitDir === 'like' ? 1 : -1;
    transform = `translate3d(${sign * 140}%, ${offset.y * 0.3}px, 0) rotate(${sign * 22}deg)`;
    transition = `transform ${EXIT_MS}ms cubic-bezier(.5,0,.9,.5)`;
  } else if (dragging || offset.x !== 0) {
    transform = `translate3d(${offset.x}px, ${offset.y * 0.35}px, 0) rotate(${offset.x / 18}deg)`;
    if (dragging) transition = 'none';
  }

  const likeOpacity = exitDir ? (exitDir === 'like' ? 1 : 0) : clamp(offset.x / 90);
  const passOpacity = exitDir ? (exitDir === 'pass' ? 1 : 0) : clamp(-offset.x / 90);

  return (
    <article className="card card-top" style={{ transform, transition }} {...bind} aria-label={`${profile.name}, ${profile.age}`}>
      <img className="card-photo" src={profile.photoUrl} alt={`${profile.name}'s photo`} draggable={false} />
      <div className="card-shade" />
      <span className="stamp stamp-like" style={{ opacity: likeOpacity }}>Like</span>
      {exitDir === 'like' && <span className="like-pop" aria-hidden="true">♥</span>}
      <span className="stamp stamp-pass" style={{ opacity: passOpacity }}>Pass</span>
      <CardInfo profile={profile} />
    </article>
  );
}

export function CardInfo({ profile }) {
  return (
    <div className="card-info">
      <h2 className="card-name">
        {profile.name} <span className="card-age">{profile.age}</span>
      </h2>
      <p className="card-place"><PinIcon width={16} height={16} /> {profile.location}</p>
      <p className="card-bio">{profile.bio}</p>
      <ul className="chips">
        {profile.interests.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  );
}
