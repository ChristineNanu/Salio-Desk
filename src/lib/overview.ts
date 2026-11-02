import type Database from "better-sqlite3";

export type OverviewActivity = {
  type: "loan" | "repayment";
  reference: string;
  clientName: string;
  amount: number;
  createdAt: string;
};

export type OverviewData = {
  activeLoans: number;
  totalOutstanding: number;
  paymentsThisMonth: number;
  clientCount: number;
  recentActivity: OverviewActivity[];
};

type ActivityRow = {
  type: "loan" | "repayment";
  reference: string;
  client_name: string;
  amount: number;
  created_at: string;
};

function monthBoundsInNairobi(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);

  // Nairobi is UTC+3, so local midnight begins at 21:00 UTC on the previous day.
  const start = new Date(Date.UTC(year, month - 1, 1, -3));
  const end = new Date(Date.UTC(year, month, 1, -3));
  return [start, end].map((date) => date.toISOString().slice(0, 19).replace("T", " ")) as [string, string];
}

export function getOverview(database: Database.Database, now = new Date()): OverviewData {
  const [monthStart, nextMonthStart] = monthBoundsInNairobi(now);
  const balances = database.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN balance > 0 THEN 1 ELSE 0 END), 0) AS active_loans,
      COALESCE(SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END), 0) AS total_outstanding
    FROM (
      SELECT loans.id,
        loans.total_due - COALESCE(SUM(repayments.amount), 0) AS balance
      FROM loans
      LEFT JOIN repayments ON repayments.loan_number = loans.loan_number
      GROUP BY loans.id
    )
  `).get() as { active_loans: number; total_outstanding: number };

  const paymentCount = database.prepare(`
    SELECT COUNT(*) AS count
    FROM repayments
    WHERE created_at >= ? AND created_at < ?
  `).get(monthStart, nextMonthStart) as { count: number };

  const clientCount = database.prepare("SELECT COUNT(*) AS count FROM clients").get() as { count: number };

  const activityRows = database.prepare(`
    SELECT type, reference, client_name, amount, created_at
    FROM (
      SELECT 'loan' AS type, loans.loan_number AS reference, clients.full_name AS client_name,
        loans.principal_amount AS amount, loans.created_at
      FROM loans
      JOIN clients ON clients.client_number = loans.client_number
      UNION ALL
      SELECT 'repayment' AS type, repayments.payment_reference AS reference, clients.full_name AS client_name,
        repayments.amount, repayments.created_at
      FROM repayments
      JOIN loans ON loans.loan_number = repayments.loan_number
      JOIN clients ON clients.client_number = loans.client_number
    )
    ORDER BY created_at DESC, reference DESC
    LIMIT 5
  `).all() as ActivityRow[];

  return {
    activeLoans: balances.active_loans,
    totalOutstanding: balances.total_outstanding,
    paymentsThisMonth: paymentCount.count,
    clientCount: clientCount.count,
    recentActivity: activityRows.map((row) => ({
      type: row.type,
      reference: row.reference,
      clientName: row.client_name,
      amount: row.amount,
      createdAt: row.created_at,
    })),
  };
}
