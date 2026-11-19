import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const config = {
  port: Number(process.env.PORT) || 4000,
  dbPath: process.env.DB_PATH || path.join(root, 'data', 'coy.db'),
  // If the client has been built (npm run build), the server also serves it.
  staticDir: process.env.STATIC_DIR || path.resolve(root, '..', 'client', 'dist'),
};
