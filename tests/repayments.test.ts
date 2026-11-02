import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import Database from "better-sqlite3";
import { initializeSchema } from "../src/lib/schema";
import { getRepaymentHistory, recordRepayment } from "../src/lib/repayments";

const openDatabases: Database.Database[] = [];

function createTestDatabase() {
  const database = new Database(":memory:");
  initializeSchema(database);
  database.prepare(`
    INSERT INTO clients (client_number, full_name, phone) VALUES (?, ?, ?)
  `).run("CL-00001", "Test Client", "+254700000000");
  database.prepare(`
    INSERT INTO loans (loan_number, client_number, principal_amount, total_due)
    VALUES (?, ?, ?, ?)
  `).run("LN-00001", "CL-00001", 10000, 12000);
  openDatabases.push(database);
  return database;
}

afterEach(() => {
  for (const database of openDatabases.splice(0)) database.close();
});

test("records a positive repayment and calculates the new balance", () => {
  const database = createTestDatabase();

  const result = recordRepayment(database, {
    loanNumber: "LN-00001",
    paymentReference: "PAY-001",
    amount: 2500,
  });

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.repayment.balanceBefore, 12000);
  assert.equal(result.repayment.balanceAfter, 9500);

  const history = getRepaymentHistory(database, "LN-00001");
  assert.equal(history?.outstandingBalance, 9500);
  assert.equal(history?.repayments.length, 1);
});

test("rejects zero and negative repayments without saving them", () => {
  const database = createTestDatabase();

  for (const amount of [0, -100]) {
    const result = recordRepayment(database, {
      loanNumber: "LN-00001",
      paymentReference: `PAY-${amount}`,
      amount,
    });
    assert.deepEqual(result, { ok: false, reason: "invalid_amount" });
  }

  const count = database.prepare("SELECT COUNT(*) AS count FROM repayments").get() as { count: number };
  assert.equal(count.count, 0);
});

test("rejects a duplicate payment reference", () => {
  const database = createTestDatabase();
  const payment = { loanNumber: "LN-00001", paymentReference: "PAY-001", amount: 1000 };

  assert.equal(recordRepayment(database, payment).ok, true);
  assert.deepEqual(recordRepayment(database, payment), { ok: false, reason: "duplicate_reference" });

  assert.throws(() => {
    database.prepare(`
      INSERT INTO repayments (loan_number, payment_reference, amount) VALUES (?, ?, ?)
    `).run(payment.loanNumber, payment.paymentReference, payment.amount);
  }, /UNIQUE constraint failed/);
});

test("rejects a repayment for a loan that does not exist", () => {
  const database = createTestDatabase();

  const result = recordRepayment(database, {
    loanNumber: "LN-MISSING",
    paymentReference: "PAY-001",
    amount: 1000,
  });

  assert.deepEqual(result, { ok: false, reason: "loan_not_found" });
});

test("rejects a repayment larger than the outstanding balance", () => {
  const database = createTestDatabase();

  const result = recordRepayment(database, {
    loanNumber: "LN-00001",
    paymentReference: "PAY-001",
    amount: 12001,
  });

  assert.deepEqual(result, { ok: false, reason: "amount_exceeds_balance" });
  assert.equal(getRepaymentHistory(database, "LN-00001")?.outstandingBalance, 12000);
});
