# Salio Desk

A small loan and repayment desk built with Next.js and TypeScript, with records kept in a local database.

## Client registration

Open **Clients** from the left navigation to add a client. A client number is assigned automatically, and each record is saved in `data/salio.db` on the server.

Open **Loans** to create a loan for a registered client. Loan numbers are assigned automatically. Amounts are stored as integer cents, total amount due must be at least the original loan amount.

Open **Repayments** to record a payment against a loan. Each payment needs a unique reference and a positive amount no greater than the remaining balance. The screen shows the before and after balance impact, and outstanding balances are calculated from the repayment history.

## Run locally

1. Install Node.js 20.9 or newer.
2. Install project dependencies with `npm install`.
3. Start the development server with `npm run dev`.
4. Open [http://localhost:3000](http://localhost:3000).

Run the automated repayment tests with `npm test`.

## Database design and business rules

The app uses SQLite with three related tables: `clients`, `loans`, and `repayments`. A loan points to its client, and each repayment points to its loan. Foreign keys keep those links valid. Client numbers, loan numbers, and payment references are unique. Loan amounts and repayment amounts are stored as integer cents to avoid rounding errors with money.

A loan's outstanding balance is its total amount due minus the sum of its repayments. Repayments must be greater than zero, refer to an existing loan, use a payment reference that has not been used before, and not exceed the remaining balance. These checks and the repayment insert run in a database transaction, so a rejected payment does not change the balance. The database also requires the total due to be at least the principal amount.

## Automated tests

Run `npm test` to run the automated tests. `tests/repayments.test.ts` covers the three assessment scenarios: a KES 3,000 payment reduces a KES 10,000 balance to KES 7,000; a repeated payment reference is rejected without adding another repayment; and a KES 1,500 payment against KES 1,000 outstanding is rejected without changing the balance. It also tests invalid amounts and missing loans.

## AI tools disclosure

I used ChatGPT for planning, implementation support and  troubleshooting. I reviewed the code and ran the automated tests. I’m responsible for understanding and explaining the submitted work.


