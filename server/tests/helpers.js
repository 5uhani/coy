import { openDb } from '../src/db/index.js';
import { createDiscoverService } from '../src/services/discoverService.js';

// 5 profiles. Profiles 1 and 2 have already liked the user (private table).
export function makeFixture(file = ':memory:') {
  const db = openDb(file);
  const n = db.prepare('SELECT COUNT(*) AS n FROM profiles').get().n;
  if (n === 0) {
    const ins = db.prepare('INSERT INTO profiles (id,name,age,photo_url,bio,location,interests,rank) VALUES (?,?,?,?,?,?,?,?)');
    for (let i = 1; i <= 5; i++) ins.run(i, `P${i}`, 20 + i, `/api/photos/${i}.svg`, `bio ${i}`, 'Bhopal', JSON.stringify(['a', 'b']), i);
    db.prepare('INSERT INTO incoming_likes (profile_id) VALUES (1), (2)').run();
  }
  return { db, service: createDiscoverService(db) };
}
