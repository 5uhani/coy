import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { makeFixture } from './helpers.js';
import { openDb } from '../src/db/index.js';
import { seedIfEmpty } from '../src/db/seed.js';
import { createDiscoverService } from '../src/services/discoverService.js';

const ids = (list) => list.map((p) => p.id);

test('seed: 30+ profiles with every required field, some already liking the user', () => {
  const db = openDb(':memory:');
  seedIfEmpty(db);
  const feed = createDiscoverService(db).getFeed();
  assert.ok(feed.length >= 30);
  for (const p of feed) {
    for (const k of ['name', 'age', 'photoUrl', 'bio', 'location']) assert.ok(p[k], `${k} missing`);
    assert.ok(Array.isArray(p.interests) && p.interests.length > 0);
  }
  assert.ok(db.prepare('SELECT COUNT(*) AS n FROM incoming_likes').get().n >= 5);
});

test('like creates a swipe and removes the profile from the feed', () => {
  const { service } = makeFixture();
  service.swipe(3, 'like');
  assert.deepEqual(ids(service.getFeed()), [1, 2, 4, 5]);
});

test('pass removes the profile from the feed and never matches', () => {
  const { service } = makeFixture();
  const res = service.swipe(1, 'pass'); // profile 1 liked the user, but we passed
  assert.deepEqual(res, { matched: false });
  assert.ok(!ids(service.getFeed()).includes(1));
  assert.equal(service.getMatches().length, 0);
});

test('match only when both sides liked', () => {
  const { service } = makeFixture();
  const mutual = service.swipe(1, 'like'); // 1 liked the user first
  assert.equal(mutual.matched, true);
  assert.equal(mutual.match.id, 1);
  const oneSided = service.swipe(3, 'like'); // 3 never liked the user
  assert.deepEqual(oneSided, { matched: false });
  assert.deepEqual(ids(service.getMatches()), [1]);
});

test('privacy: one-sided likes are never revealed anywhere', () => {
  const { service } = makeFixture();
  const allowed = ['id', 'name', 'age', 'photoUrl', 'bio', 'location', 'interests'];
  for (const p of service.getFeed()) assert.deepEqual(Object.keys(p), allowed);
  // Responses to like and pass on a non-liker and on a liker (pass) are identical.
  assert.deepEqual(service.swipe(3, 'like'), { matched: false });
  assert.deepEqual(service.swipe(4, 'pass'), { matched: false });
  assert.deepEqual(service.swipe(2, 'pass'), { matched: false }); // 2 liked us, we passed
  assert.deepEqual(service.getMatches(), []);
  assert.ok(!/like/i.test(JSON.stringify(service.getFeed())));
});

test('duplicate swipes are rejected and never create duplicate matches', () => {
  const { service } = makeFixture();
  service.swipe(1, 'like');
  assert.throws(() => service.swipe(1, 'like'), { status: 409 });
  assert.throws(() => service.swipe(1, 'pass'), { status: 409 });
  assert.equal(service.getMatches().length, 1);
});

test('validation: bad ids, unknown profiles and bad actions', () => {
  const { service } = makeFixture();
  assert.throws(() => service.swipe('abc', 'like'), { status: 400 });
  assert.throws(() => service.swipe(-1, 'like'), { status: 400 });
  assert.throws(() => service.swipe(1.5, 'like'), { status: 400 });
  assert.throws(() => service.swipe(undefined, 'like'), { status: 400 });
  assert.throws(() => service.swipe(1, 'superlike'), { status: 400 });
  assert.throws(() => service.swipe(999, 'like'), { status: 404 });
  assert.equal(service.getFeed().length, 5); // failed requests changed nothing
});

test('empty feed once everyone has been swiped', () => {
  const { service } = makeFixture();
  for (let i = 1; i <= 5; i++) service.swipe(i, i % 2 ? 'like' : 'pass');
  assert.deepEqual(service.getFeed(), []);
});

test('swipes and matches persist across a restart (reopen the database file)', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'coy-')), 'test.db');
  const first = makeFixture(file);
  first.service.swipe(1, 'like');
  first.service.swipe(3, 'pass');
  first.db.close();

  const second = makeFixture(file); // "restarted server"
  assert.deepEqual(ids(second.service.getFeed()), [2, 4, 5]);
  assert.deepEqual(ids(second.service.getMatches()), [1]);
  assert.throws(() => second.service.swipe(1, 'like'), { status: 409 });
  second.db.close();
});
