"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { Client } from "@/lib/clients";
import type { Loan } from "@/lib/loans";

function formatMoney(minorUnits: number) {
  return new Intl.NumberFormat("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minorUnits / 100);
}

export function LoanDirectory() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [clientsResponse, loansResponse] = await Promise.all([
          fetch("/api/clients"),
          fetch("/api/loans"),
        ]);
        if (!clientsResponse.ok || !loansResponse.ok) throw new Error("Could not load the loan register.");

        const [clientData, loanData]: [{ clients: Client[] }, { loans: Loan[] }] = await Promise.all([
          clientsResponse.json(),
          loansResponse.json(),
        ]);
        setClients(clientData.clients);
        setLoans(loanData.loans);
      } catch {
        setError("Could not load the loan register. Refresh the page to try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientNumber: values.get("clientNumber"),
          principalAmount: values.get("principalAmount"),
          totalDue: values.get("totalDue"),
        }),
      });
      const data: { loan?: Loan; error?: string } = await response.json();
      const newLoan = data.loan;
      if (!response.ok || !newLoan) throw new Error(data.error ?? "Could not save this loan.");

      setLoans((current) => [newLoan, ...current]);
      setSuccess(`${newLoan.loanNumber} added successfully.`);
      form.reset();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this loan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="welcome-row">
        <div><p className="eyebrow">LOAN RECORDS</p><h1>Loans</h1><p className="welcome-copy">Create a loan and keep its starting balance clear.</p></div>
      </div>

      <div className="client-layout">
        <section className="client-form-card" aria-labelledby="new-loan-heading">
          <div className="section-heading"><div><h2 id="new-loan-heading">Create a loan</h2><p>Loan numbers are assigned automatically.</p></div></div>
          {clients.length === 0 && !isLoading ? (
            <div className="list-empty"><span className="list-empty-icon">♙</span><strong>Add a client first</strong><p>A loan must belong to a registered client.</p><Link className="text-button" href="/clients">Go to clients →</Link></div>
          ) : (
            <form className="client-form" onSubmit={handleSubmit}>
              <label htmlFor="clientNumber">Client <span>*</span></label>
              <select id="clientNumber" name="clientNumber" required defaultValue="" disabled={isLoading || isSaving}>
                <option value="" disabled>{isLoading ? "Loading clients…" : "Choose a client"}</option>
                {clients.map((client) => <option key={client.clientNumber} value={client.clientNumber}>{client.fullName} · {client.clientNumber}</option>)}
              </select>

              <label htmlFor="principalAmount">Original loan amount (KES) <span>*</span></label>
              <input id="principalAmount" name="principalAmount" type="text" inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" required placeholder="e.g. 10000.00" />

              <label htmlFor="totalDue">Total amount due (KES) <span>*</span></label>
              <input id="totalDue" name="totalDue" type="text" inputMode="decimal" pattern="[0-9]+(\.[0-9]{1,2})?" required placeholder="e.g. 12000.00" />

              <p className="field-hint">Total amount due should be at least the original loan amount.</p>
              {error && <p className="form-message error-message" role="alert">{error}</p>}
              {success && <p className="form-message success-message" role="status">{success}</p>}
              <button className="primary-button form-submit" type="submit" disabled={isSaving || isLoading || clients.length === 0}>{isSaving ? "Saving…" : "＋ Create loan"}</button>
            </form>
          )}
        </section>

        <section className="client-list-card" aria-labelledby="loan-list-heading">
          <div className="section-heading"><div><h2 id="loan-list-heading">All loans <span className="count-pill">{loans.length}</span></h2><p>Loans saved on this desk</p></div></div>
          {isLoading ? <p className="list-placeholder">Loading loans…</p> : loans.length === 0 ? (
            <div className="list-empty"><span className="list-empty-icon">▤</span><strong>No loans yet</strong><p>Created loans will appear here.</p></div>
          ) : (
            <ul className="client-list">
              {loans.map((loan) => (
                <li className="loan-row" key={loan.loanNumber}>
                  <span className="client-avatar">{loan.clientName.trim().charAt(0).toUpperCase()}</span>
                  <span className="client-details"><strong>{loan.clientName}</strong><small>{loan.loanNumber} · Principal KES {formatMoney(loan.principalAmount)}</small></span>
                  <span className="loan-balance"><small>Outstanding</small><strong>KES {formatMoney(loan.outstandingBalance)}</strong></span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
