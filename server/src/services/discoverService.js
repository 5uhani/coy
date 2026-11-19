import { DuplicateSwipeError, NotFoundError, ValidationError } from '../lib/errors.js';

export const ME = { id: 'me', name: 'You', photoUrl: '/api/photos/me.svg' };

// The ONLY shape in which a profile ever leaves the service. There is
// deliberately no field saying whether the profile liked the user.
const toPublic = (row) => ({
  id: row.id,
  name: row.name,
  age: row.age,
  photoUrl: row.photo_url,
  bio: row.bio,
  location: row.location,
  interests: JSON.parse(row.interests),
});

const PUBLIC_COLUMNS = 'p.id, p.name, p.age, p.photo_url, p.bio, p.location, p.interests';

export function createDiscoverService(db) {
  const stmts = {
    feed: db.prepare(
      `SELECT ${PUBLIC_COLUMNS} FROM profiles p
       WHERE p.id NOT IN (SELECT profile_id FROM swipes)
       ORDER BY p.rank`
    ),
    profile: db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM profiles p WHERE p.id = ?`),
    swiped: db.prepare('SELECT 1 FROM swipes WHERE profile_id = ?'),
    insertSwipe: db.prepare('INSERT INTO swipes (profile_id, action, created_at) VALUES (?,?,?)'),
    likedMe: db.prepare('SELECT 1 FROM incoming_likes WHERE profile_id = ?'), // private
    insertMatch: db.prepare('INSERT OR IGNORE INTO matches (profile_id, created_at) VALUES (?,?)'),
    matches: db.prepare(
      `SELECT ${PUBLIC_COLUMNS}, m.created_at AS matched_at
       FROM matches m JOIN profiles p ON p.id = m.profile_id
       ORDER BY m.created_at DESC, p.id DESC`
    ),
  };

  function parseProfileId(value) {
    const id = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value;
    if (!Number.isInteger(id) || id <= 0) throw new ValidationError('profileId must be a positive integer');
    return id;
  }

  return {
    getMe: () => ME,

    getFeed: () => stmts.feed.all().map(toPublic),

    getMatches: () => stmts.matches.all().map((row) => ({ ...toPublic(row), matchedAt: row.matched_at })),

    swipe(rawProfileId, action) {
      const profileId = parseProfileId(rawProfileId);
      if (action !== 'like' && action !== 'pass') {
        throw new ValidationError("action must be either 'like' or 'pass'");
      }

      db.exec('BEGIN IMMEDIATE');
      try {
        const profile = stmts.profile.get(profileId);
        if (!profile) throw new NotFoundError('Profile not found');
        if (stmts.swiped.get(profileId)) throw new DuplicateSwipeError();

        const now = new Date().toISOString();
        stmts.insertSwipe.run(profileId, action, now);

        // A match needs BOTH sides: the user liked them just now AND they had
        // already liked the user. Only then is anything revealed.
        const matched = action === 'like' && Boolean(stmts.likedMe.get(profileId));
        if (matched) stmts.insertMatch.run(profileId, now);
        db.exec('COMMIT');

        // A non-match response is identical for like and pass: nothing leaks.
        return matched
          ? { matched: true, match: { ...toPublic(profile), matchedAt: now } }
          : { matched: false };
      } catch (err) {
        db.exec('ROLLBACK');
        throw err;
      }
    },

    getPhotoInfo(idOrMe) {
      if (idOrMe === 'me') return { seed: 0, name: ME.name };
      const row = stmts.profile.get(Number(idOrMe));
      return row ? { seed: row.id, name: row.name } : null;
    },
  };
}
