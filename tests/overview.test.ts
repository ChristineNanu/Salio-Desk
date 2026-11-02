import assert from "node:assert/strict";
import { test } from "node:test";
import Database from "better-sqlite3";
import { getOverview } from "../src/lib/overview";
import { initializeSchema } from "../src/lib/schema";

test("summarizes outstanding loans, Nairobi month payments, and recent activity", () => {
  const database = new Database(":memory:");
  initializeSchema(database);

  try {
    database.prepare(`
      INSERT INTO clients (client_number, full_name, phone) VALUES (?, ?, ?)
    `).run("CL-00001", "Test Client", "+254700000000");
    database.prepare(`
      INSERT INTO loans (loan_number, client_number, principal_amount, total_due, created_at)
      VALUES (?, ?, ?, ?, ?), (?, ?, ?, ?, ?)
    `).run(
      "LN-00001", "CL-00001", 10000, 12000, "2026-11-01 00:00:00",
      "LN-00002", "CL-00001", 5000, 5000, "2026-11-01 00:00:00",
    );
    database.prepare(`
      INSERT INTO repayments (loan_number, payment_reference, amount, created_at)
      VALUES (?, ?, ?, ?), (?, ?, ?, ?)
    `).run(
      "LN-00001", "PAY-NOV", 2500, "2026-11-01 21:00:00",
      "LN-00002", "PAY-OCT", 5000, "2026-10-31 20:59:59",
    );

    const overview = getOverview(database, new Date("2026-11-02T00:00:00+03:00"));

    assert.equal(overview.activeLoans, 1);
    assert.equal(overview.totalOutstanding, 9500);
    assert.equal(overview.paymentsThisMonth, 1);
    assert.equal(overview.clientCount, 1);
    assert.equal(overview.recentActivity[0]?.reference, "PAY-NOV");
  } finally {
    database.close();
  }
});
