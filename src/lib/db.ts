import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export const db = await open({
  filename: './src/db/database.db',
  driver: sqlite3.Database,
});

// Crear las tablas si no existen
await db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  hashed_password TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  expires_at INTEGER
);
`);
