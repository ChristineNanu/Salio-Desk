# Salio Desk

A small loan and repayment desk built with Next.js, TypeScript, and SQLite.

## Client registration

Open **Clients** from the left navigation to add a client. A client number is assigned automatically, and each record is saved in `data/salio.db` on the server.

Open **Loans** to create a loan for a registered client. Loan numbers are assigned automatically. Amounts are stored as integer cents; for this demo, total amount due must be at least the original loan amount.

Open **Repayments** to record a payment against a loan. Each payment needs a unique reference and a positive amount no greater than the remaining balance. The screen shows the before and after balance impact, and outstanding balances are calculated from the repayment history.

## Run locally

1. Install Node.js 20.9 or newer.
2. Install project dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

The current screen is the initial dashboard shell. Client, loan, and repayment workflows will be added in small steps.
