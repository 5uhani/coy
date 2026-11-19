// HTTP-level tests. They need Express (npm install) and skip themselves otherwise.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { makeFixture } from './helpers.js';

const express = await import('express').catch(() => null);
const opts = { skip: express ? false : 'express is not installed (run npm install)' };

let server, base;
before(async () => {
  if (!express) return;
  const { createApp } = await import('../src/app.js');
  server = createApp(makeFixture().db).listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server?.close());

const post = (body, raw) =>
  fetch(`${base}/swipe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: raw ?? JSON.stringify(body) });

test('GET /feed returns only public fields', opts, async () => {
  const res = await fetch(`${base}/feed`);
  assert.equal(res.status, 200);
  const { profiles } = await res.json();
  assert.equal(profiles.length, 5);
  assert.ok(!JSON.stringify(profiles).toLowerCase().includes('like'));
});

test('POST /swipe: 201 on success, 409 duplicate, 400 invalid, 404 unknown, 400 bad JSON', opts, async () => {
  assert.equal((await post({ profileId: 3, action: 'like' })).status, 201);
  assert.equal((await post({ profileId: 3, action: 'like' })).status, 409);
  assert.equal((await post({ profileId: 4, action: 'nope' })).status, 400);
  assert.equal((await post({ profileId: 999, action: 'like' })).status, 404);
  assert.equal((await post(null, '{bad json')).status, 400);
});

test('mutual match shows in POST /swipe and GET /matches only', opts, async () => {
  const res = await post({ profileId: 1, action: 'like' });
  assert.equal((await res.json()).matched, true);
  const { matches } = await (await fetch(`${base}/matches`)).json();
  assert.deepEqual(matches.map((m) => m.id), [1]);
  assert.equal((await fetch(`${base}/nothing`)).status, 404);
});
