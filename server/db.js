import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, 'data');
mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.DB_PATH || join(dataDir, 'vacas.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS aportes (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha      DATE UNIQUE NOT NULL,
    monto_gs   INTEGER NOT NULL,
    nota       TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

// Valores de configuración por defecto para el viaje a Guaratuba 2027.
export const CONFIG_DEFAULTS = {
  destino: 'Guaratuba, Paraná, Brasil',
  origen: 'Asunción, Paraguay',
  personas: '3',
  fecha_inicio: '2026-07-01',      // desde cuándo se mide la línea ideal
  fecha_salida: '2027-02-16',      // fecha objetivo del viaje
  meta_total_usd: '1500',          // meta total en dólares
  aporte_diario_gs: '50000',       // meta de aporte diario en guaraníes
  tipo_cambio: '7300'              // guaraníes por 1 USD (referencial)
};

const insertConfig = db.prepare(
  'INSERT OR IGNORE INTO config (clave, valor) VALUES (?, ?)'
);
for (const [clave, valor] of Object.entries(CONFIG_DEFAULTS)) {
  insertConfig.run(clave, valor);
}

export default db;
