import 'dotenv/config';
import { pathToFileURL } from 'url';
import { app } from './app.js';
import { pool } from './lib/db.js';
import { seedIfEmpty } from './scripts/seed.js';

const PORT = 8080;

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const REQUIRED_ENV = ['JWT_SECRET', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = REQUIRED_ENV.filter(k => !process.env[k]);
  if (missing.length) {
    console.error(`FATAL: variables d'environnement manquantes : ${missing.join(', ')}`);
    process.exit(1);
  }

  pool.query('SELECT 1')
    .then(() => seedIfEmpty())
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Serveur GTI525 démarré sur http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('FATAL:', err.message);
      process.exit(1);
    });
}

export { app };
