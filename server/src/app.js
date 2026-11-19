import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import { createDiscoverService } from './services/discoverService.js';
import { createRouter } from './routes/index.js';
import { HttpError } from './lib/errors.js';

export function createApp(db, { staticDir, log = false } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));

  // Logs method, path and status ONLY. Never bodies or response payloads, so
  // swipes and likes cannot end up in logs.
  if (log) {
    app.use((req, res, next) => {
      res.on('finish', () => console.log(`${req.method} ${req.path} ${res.statusCode}`));
      next();
    });
  }

  const router = createRouter(createDiscoverService(db));
  app.use(router); // /feed, /swipe, /matches
  app.use('/api', router); // same routes under /api for the Vite dev proxy

  if (staticDir && fs.existsSync(path.join(staticDir, 'index.html'))) {
    app.use(express.static(staticDir));
  }

  app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message });
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
    console.error('Unhandled error:', err.message); // message only, no payloads
    return res.status(500).json({ error: 'Something went wrong on our side' });
  });

  return app;
}
