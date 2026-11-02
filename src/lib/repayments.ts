import { db } from "@/lib/db";

export type Repayment = {
  paymentReference: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: string;
};

export type RepaymentHistory = {
  loanNumber: string;
  clientName: string;
  totalDue: number;
  outstandingBalance: number;
  repayments: Repayment[];
};

type LoanSummaryRow = {
  loan_number: string;
  client_name: string;
  total_due: number;
};

type RepaymentRow = {
  payment_reference: string;
  amount: number;
  created_at: string;
};

export function getRepaymentHistory(loanNumber: string): RepaymentHistory | null {
  const loan = db.prepare(`
    SELECT loans.loan_number, clients.full_name AS client_name, loans.total_due
    FROM loans
    JOIN clients ON clients.client_number = loans.client_number
    WHERE loans.loan_number = ?
  `).get(loanNumber) as LoanSummaryRow | undefined;

  if (!loan) return null;

  const rows = db.prepare(`
    SELECT payment_reference, amount, created_at
    FROM repayments
    WHERE loan_number = ?
    ORDER BY id ASC
  `).all(loanNumber) as RepaymentRow[];

  let balance = loan.total_due;
  const repayments = rows.map((row) => {
    const balanceBefore = balance;
    balance -= row.amount;
    return {
      paymentReference: row.payment_reference,
      amount: row.amount,
      balanceBefore,
      balanceAfter: balance,
      createdAt: row.created_at,
    };
  });

  return {
    loanNumber: loan.loan_number,
    clientName: loan.client_name,
    totalDue: loan.total_due,
    outstandingBalance: balance,
    repayments: repayments.reverse(),
  };
}

export type RecordRepaymentResult =
  | { ok: true; repayment: Repayment }
  | { ok: false; reason: "loan_not_found" | "duplicate_reference" | "amount_exceeds_balance" };

export function recordRepayment(input: {
  loanNumber: string;
  paymentReference: string;
  amount: number;
}): RecordRepaymentResult {
  const write = db.transaction((): RecordRepaymentResult => {
    const loan = db.prepare(`
      SELECT total_due FROM loans WHERE loan_number = ?
    `).get(input.loanNumber) as { total_due: number } | undefined;

    if (!loan) return { ok: false, reason: "loan_not_found" };

    const duplicate = db.prepare(`
      SELECT 1 FROM repayments WHERE payment_reference = ?
    `).get(input.paymentReference);

    if (duplicate) return { ok: false, reason: "duplicate_reference" };

    const paid = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) AS total_paid
      FROM repayments WHERE loan_number = ?
    `).get(input.loanNumber) as { total_paid: number };
    const balanceBefore = loan.total_due - paid.total_paid;

    if (input.amount > balanceBefore) return { ok: false, reason: "amount_exceeds_balance" };

    const insert = db.prepare(`
      INSERT INTO repayments (loan_number, payment_reference, amount)
      VALUES (?, ?, ?)
    `).run(input.loanNumber, input.paymentReference, input.amount);
    const saved = db.prepare("SELECT created_at FROM repayments WHERE id = ?")
      .get(insert.lastInsertRowid) as { created_at: string };

    return {
      ok: true,
      repayment: {
        paymentReference: input.paymentReference,
        amount: input.amount,
        balanceBefore,
        balanceAfter: balanceBefore - input.amount,
        createdAt: saved.created_at,
      },
    };
  });

  return write.immediate();
}
