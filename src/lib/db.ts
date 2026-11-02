import "server-only";

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { initializeSchema } from "@/lib/schema";

const dataDirectory = join(process.cwd(), "data");
mkdirSync(dataDirectory, { recursive: true });

type DatabaseCache = typeof globalThis & { salioDatabase?: Database.Database };
const globalWithDatabase = globalThis as DatabaseCache;

export const db = globalWithDatabase.salioDatabase ?? new Database(join(dataDirectory, "salio.db"));

db.pragma("journal_mode = WAL");
initializeSchema(db);

if (process.env.NODE_ENV !== "production") {
  globalWithDatabase.salioDatabase = db;
}
