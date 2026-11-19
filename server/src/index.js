import { createApp } from './app.js';
import { openDb } from './db/index.js';
import { seedIfEmpty } from './db/seed.js';
import { config } from './config.js';

const db = openDb(config.dbPath);
if (seedIfEmpty(db)) console.log('Database was empty: seeded mock profiles.');

const server = createApp(db, { staticDir: config.staticDir, log: true }).listen(config.port, () => {
  console.log(`Coy Discover API listening on http://localhost:${config.port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
