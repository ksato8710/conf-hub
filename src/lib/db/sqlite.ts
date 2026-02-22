import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DEFAULT_DB_RELATIVE_PATH = 'data/confhub.sqlite';

const EVENT_SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  timezone TEXT NOT NULL DEFAULT 'Asia/Tokyo',
  format TEXT NOT NULL CHECK (format IN ('online', 'offline', 'hybrid')),
  venue TEXT,
  address TEXT,
  region TEXT,
  online_url TEXT,
  target_roles TEXT NOT NULL DEFAULT '[]',
  tech_categories TEXT NOT NULL DEFAULT '[]',
  design_categories TEXT NOT NULL DEFAULT '[]',
  capacity INTEGER,
  price INTEGER NOT NULL DEFAULT 0,
  early_bird_price INTEGER,
  early_bird_deadline TEXT,
  official_url TEXT NOT NULL,
  ticket_url TEXT,
  twitter_hashtag TEXT,
  source TEXT,
  is_premium INTEGER NOT NULL DEFAULT 0 CHECK (is_premium IN (0, 1)),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_format ON events(format);
CREATE INDEX IF NOT EXISTS idx_events_region ON events(region);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(is_featured);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
`;

type GlobalWithDb = typeof globalThis & {
  __confhubSqliteDb?: DatabaseSync;
};

const globalWithDb = globalThis as GlobalWithDb;

function resolveDbPath(): string {
  const configuredPath = process.env.CONFHUB_DB_PATH?.trim();
  if (!configuredPath) {
    return path.join(process.cwd(), DEFAULT_DB_RELATIVE_PATH);
  }

  if (path.isAbsolute(configuredPath)) {
    return configuredPath;
  }

  return path.join(process.cwd(), configuredPath);
}

function initializeSchema(db: DatabaseSync): void {
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA busy_timeout = 5000;');
  db.exec(EVENT_SCHEMA_SQL);
}

export function getSqliteDbPath(): string {
  return resolveDbPath();
}

export function getSqliteDb(): DatabaseSync {
  if (globalWithDb.__confhubSqliteDb) {
    return globalWithDb.__confhubSqliteDb;
  }

  const dbPath = resolveDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  initializeSchema(db);

  globalWithDb.__confhubSqliteDb = db;
  return db;
}
