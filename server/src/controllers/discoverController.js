import { renderAvatar } from '../lib/avatar.js';
import { NotFoundError, ValidationError } from '../lib/errors.js';

export function createDiscoverController(service) {
  return {
    me: (_req, res) => res.json({ user: service.getMe() }),

    feed: (_req, res) => {
      const profiles = service.getFeed();
      res.json({ profiles, count: profiles.length });
    },

    swipe: (req, res) => {
      const body = req.body;
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        throw new ValidationError('Request body must be a JSON object with profileId and action');
      }
      res.status(201).json(service.swipe(body.profileId, body.action));
    },

    matches: (_req, res) => {
      const matches = service.getMatches();
      res.json({ matches, count: matches.length });
    },

    photo: (req, res) => {
      const m = /^(\d+|me)\.svg$/.exec(req.params.file);
      const info = m && service.getPhotoInfo(m[1]);
      if (!info) throw new NotFoundError('Photo not found');
      res.set('Cache-Control', 'public, max-age=86400').type('image/svg+xml').send(renderAvatar(info.seed, info.name));
    },
  };
}
