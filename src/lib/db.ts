import "server-only";

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";

const dataDirectory = join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });

type DatabaseCache = typeof globalThis & { salioDatabase?: Database.Database };
const globalWithDatabase = globalThis as DatabaseCache;

export const db = globalWithDatabase.salioDatabase ?? new Database(join(dataDirectory, "salio.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_number TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    loan_number TEXT NOT NULL UNIQUE,
    client_number TEXT NOT NULL REFERENCES clients(client_number),
    principal_amount INTEGER NOT NULL CHECK (principal_amount > 0),
    total_due INTEGER NOT NULL CHECK (total_due >= principal_amount),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

if (process.env.NODE_ENV !== "production") {
  globalWithDatabase.salioDatabase = db;
}
