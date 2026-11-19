import { Router } from 'express';
import { createDiscoverController } from '../controllers/discoverController.js';

export function createRouter(service) {
  const c = createDiscoverController(service);
  const router = Router();
  router.get('/health', (_req, res) => res.json({ ok: true }));
  router.get('/me', c.me);
  router.get('/feed', c.feed);
  router.post('/swipe', c.swipe);
  router.get('/matches', c.matches);
  router.get('/photos/:file', c.photo);
  return router;
}
