import type Database from "better-sqlite3";

export function initializeSchema(database: Database.Database) {
  database.pragma("foreign_keys = ON");
  database.exec(`
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

    CREATE TABLE IF NOT EXISTS repayments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_number TEXT NOT NULL REFERENCES loans(loan_number),
      payment_reference TEXT NOT NULL UNIQUE,
      amount INTEGER NOT NULL CHECK (amount > 0),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
