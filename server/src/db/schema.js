// incoming_likes is PRIVATE: it records which profiles have liked the logged-in
// user. It is only ever read by DiscoverService.swipe() to decide whether a
// like becomes a mutual match. No query that feeds an API response touches it.
export const SCHEMA = `
CREATE TABLE IF NOT EXISTS profiles (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  age       INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  bio       TEXT NOT NULL,
  location  TEXT NOT NULL,
  interests TEXT NOT NULL,
  rank      INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS incoming_likes (
  profile_id INTEGER PRIMARY KEY REFERENCES profiles(id)
);
CREATE TABLE IF NOT EXISTS swipes (
  profile_id INTEGER PRIMARY KEY REFERENCES profiles(id),
  action     TEXT NOT NULL CHECK (action IN ('like','pass')),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS matches (
  profile_id INTEGER PRIMARY KEY REFERENCES profiles(id),
  created_at TEXT NOT NULL
);
`;
