import { fileURLToPath } from 'node:url';
import { openDb } from './index.js';
import { PROFILES } from './seedData.js';
import { config } from '../config.js';

// Small deterministic PRNG so the feed order is stable between seeds.
function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled(list, rand) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function seedIfEmpty(db) {
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM profiles').get();
  if (n > 0) return false;

  const order = shuffled(PROFILES.map((_, i) => i), mulberry32(2026));
  // Make sure a demo reaches a match quickly: someone who already liked the
  // user appears within the first few cards. The order reveals nothing, since
  // the feed has the same shape for every profile.
  const firstLiker = order.findIndex((i) => PROFILES[i][5] === 1);
  if (firstLiker > 3) [order[2], order[firstLiker]] = [order[firstLiker], order[2]];

  const insertProfile = db.prepare(
    'INSERT INTO profiles (id, name, age, photo_url, bio, location, interests, rank) VALUES (?,?,?,?,?,?,?,?)'
  );
  const insertLike = db.prepare('INSERT INTO incoming_likes (profile_id) VALUES (?)');

  db.exec('BEGIN');
  try {
    order.forEach((idx, rank) => {
      const [name, age, location, bio, interests, likesYou] = PROFILES[idx];
      const id = idx + 1;
      insertProfile.run(id, name, age, `/api/photos/${id}.svg`, bio, location, JSON.stringify(interests), rank);
      if (likesYou) insertLike.run(id);
    });
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  return true;
}

export function resetAndSeed(db) {
  db.exec('DELETE FROM matches; DELETE FROM swipes; DELETE FROM incoming_likes; DELETE FROM profiles;');
  return seedIfEmpty(db);
}

// `npm run seed` wipes swipes/matches and re-seeds the database.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDb(config.dbPath);
  resetAndSeed(db);
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM profiles').get();
  console.log(`Seeded ${n} profiles into ${config.dbPath}`);
  db.close();
}
