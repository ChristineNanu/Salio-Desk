import { db } from "@/lib/db";

export type Loan = {
  loanNumber: string;
  clientNumber: string;
  clientName: string;
  principalAmount: number;
  totalDue: number;
  outstandingBalance: number;
  createdAt: string;
};

type LoanRow = {
  loan_number: string;
  client_number: string;
  client_name: string;
  principal_amount: number;
  total_due: number;
  created_at: string;
};

function toLoan(row: LoanRow): Loan {
  return {
    loanNumber: row.loan_number,
    clientNumber: row.client_number,
    clientName: row.client_name,
    principalAmount: row.principal_amount,
    totalDue: row.total_due,
    outstandingBalance: row.total_due,
    createdAt: row.created_at,
  };
}

export function listLoans(): Loan[] {
  const rows = db.prepare(`
    SELECT loans.loan_number, loans.client_number, clients.full_name AS client_name,
      loans.principal_amount, loans.total_due, loans.created_at
    FROM loans
    JOIN clients ON clients.client_number = loans.client_number
    ORDER BY loans.id DESC
  `).all() as LoanRow[];

  return rows.map(toLoan);
}

export function clientExists(clientNumber: string): boolean {
  return Boolean(db.prepare("SELECT 1 FROM clients WHERE client_number = ?").get(clientNumber));
}

export function createLoan(input: {
  clientNumber: string;
  principalAmount: number;
  totalDue: number;
}): Loan {
  const create = db.transaction(() => {
    const result = db.prepare(`
      INSERT INTO loans (loan_number, client_number, principal_amount, total_due)
      VALUES ('pending', ?, ?, ?)
    `).run(input.clientNumber, input.principalAmount, input.totalDue);
    const loanNumber = `LN-${String(result.lastInsertRowid).padStart(5, "0")}`;

    db.prepare("UPDATE loans SET loan_number = ? WHERE id = ?").run(loanNumber, result.lastInsertRowid);

    return db.prepare(`
      SELECT loans.loan_number, loans.client_number, clients.full_name AS client_name,
        loans.principal_amount, loans.total_due, loans.created_at
      FROM loans
      JOIN clients ON clients.client_number = loans.client_number
      WHERE loans.id = ?
    `).get(result.lastInsertRowid) as LoanRow;
  });

  return toLoan(create());
}

export function parseAmount(value: unknown): number | null {
  if (typeof value !== "string" || !/^\d+(?:\.\d{1,2})?$/.test(value.trim())) return null;

  const [whole, fraction = ""] = value.trim().split(".");
  const minorUnits = BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"));
  if (minorUnits > BigInt(Number.MAX_SAFE_INTEGER)) return null;

  return Number(minorUnits);
}

