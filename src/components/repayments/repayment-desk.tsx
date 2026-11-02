"use client";

import { type FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import type { Loan } from "@/lib/loans";
import type { Repayment, RepaymentHistory } from "@/lib/repayments";

type Confirmation = {
  repayment: Repayment;
  loanNumber: string;
};

function formatMoney(minorUnits: number) {
  return new Intl.NumberFormat("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minorUnits / 100);
}

function formatDate(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function RepaymentDesk() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedLoanNumber, setSelectedLoanNumber] = useState("");
  const [history, setHistory] = useState<RepaymentHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  useEffect(() => {
    async function loadLoans() {
      try {
        const response = await fetch("/api/loans");
        if (!response.ok) throw new Error("Could not load loans.");
        const data: { loans: Loan[] } = await response.json();
        setLoans(data.loans);
        setSelectedLoanNumber(data.loans[0]?.loanNumber ?? "");
      } catch {
        setError("Could not load loans. Refresh the page to try again.");
      } finally {
        setIsLoading(false);
      }
    }

    void loadLoans();
  }, []);

  useEffect(() => {
    if (!selectedLoanNumber) {
      return;
    }

    let isCurrent = true;
    async function loadHistory() {
      setIsHistoryLoading(true);
      setHistoryError("");
      try {
        const response = await fetch(`/api/repayments?loanNumber=${encodeURIComponent(selectedLoanNumber)}`);
        const data: { history?: RepaymentHistory; error?: string } = await response.json();
        if (!response.ok || !data.history) throw new Error(data.error ?? "Could not load repayment history.");
        if (isCurrent) setHistory(data.history);
      } catch (caught) {
        if (isCurrent) setHistoryError(caught instanceof Error ? caught.message : "Could not load repayment history.");
      } finally {
        if (isCurrent) setIsHistoryLoading(false);
      }
    }

    void loadHistory();
    return () => { isCurrent = false; };
  }, [selectedLoanNumber]);

  const selectedLoan = loans.find((loan) => loan.loanNumber === selectedLoanNumber) ?? null;
  const visibleHistory = history?.loanNumber === selectedLoanNumber ? history : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setConfirmation(null);
    setIsSaving(true);

    const form = event.currentTarget;
    const values = new FormData(form);

    try {
      const response = await fetch("/api/repayments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanNumber: selectedLoanNumber,
          paymentReference: values.get("paymentReference"),
          amount: values.get("amount"),
        }),
      });
      const data: { repayment?: Repayment; error?: string } = await response.json();
      const repayment = data.repayment;
      if (!response.ok || !repayment) throw new Error(data.error ?? "Could not save this repayment.");

      setConfirmation({ repayment, loanNumber: selectedLoanNumber });
      form.reset();

      const [loansResponse, historyResponse] = await Promise.all([
        fetch("/api/loans"),
        fetch(`/api/repayments?loanNumber=${encodeURIComponent(selectedLoanNumber)}`),
      ]);
      if (loansResponse.ok) {
        const loansData: { loans: Loan[] } = await loansResponse.json();
        setLoans(loansData.loans);
      }
      if (historyResponse.ok) {
        const historyData: { history: RepaymentHistory } = await historyResponse.json();
        setHistory(historyData.history);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save this repayment.");
    } finally {
      setIsSaving(false);
    }
  }

  if (!isLoading && loans.length === 0) {
    return (
      <>
        <div className="welcome-row"><div><p className="eyebrow">PAYMENT RECORDS</p><h1>Repayments</h1><p className="welcome-copy">Record a payment and see how it changes a loan balance.</p></div></div>
        <section className="activity-card repayment-empty">
          <div className="list-empty"><span className="list-empty-icon">↙</span><strong>No loans to repay yet</strong><p>Create a client and loan before recording a repayment.</p><Link className="secondary-button" href="/loans">Go to loans</Link></div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="welcome-row">
        <div><p className="eyebrow">PAYMENT RECORDS</p><h1>Repayments</h1><p className="welcome-copy">Record a payment and see how it changes a loan balance.</p></div>
      </div>

      <div className="client-layout repayment-layout">
        <section className="client-form-card" aria-labelledby="record-payment-heading">
          <div className="section-heading"><div><h2 id="record-payment-heading">Record a repayment</h2><p>Payment references must be unique.</p></div></div>
          <form className="client-form" onSubmit={handleSubmit}>
            <label htmlFor="loanNumber">Loan <span>*</span></label>
            <select id="loanNumber" value={selectedLoanNumber} onChange={(event) => { setSelectedLoanNumber(event.target.value); setConfirmation(null); }} required disabled={isLoading || isSaving}>
              {loans.map((loan) => <option key={loan.loanNumber} value={loan.loanNumber}>{loan.loanNumber} · {loan.clientName}</option>)}
            </select>
            {selectedLoan && <p className="field-hint loan-balance-hint">Current outstanding: <strong>KES {formatMoney(selectedLoan.outstandingBalance)}</strong></p>}

            <label htmlFor="paymentReference">Payment reference <span>*</span></label>
            <input id="paymentReference" name="paymentReference" type="text" maxLength={100} required placeholder="e.g. MPESA QAB12CD34" />

            <label htmlFor="amount">Amount received (KES) <span>*</span></label>
            <input id="amount" name="amount" type="text" inputMode="decimal" maxLength={17} pattern="[0-9]+(\.[0-9]{1,2})?" required placeholder="e.g. 2500.00" />

            {error && <p className="form-message error-message" role="alert">{error}</p>}
            {confirmation?.loanNumber === selectedLoanNumber && (
              <div className="payment-confirmation" role="status">
                <strong>Payment recorded</strong>
                <span>KES {formatMoney(confirmation.repayment.balanceBefore)} <i>→</i> KES {formatMoney(confirmation.repayment.amount)} <i>→</i> KES {formatMoney(confirmation.repayment.balanceAfter)}</span>
                <small>Balance before · Payment · Balance after</small>
              </div>
            )}
            <button className="primary-button form-submit" type="submit" disabled={isSaving || isLoading || !selectedLoan || selectedLoan.outstandingBalance === 0}>
              {isSaving ? "Saving…" : selectedLoan?.outstandingBalance === 0 ? "Loan fully repaid" : "＋ Record repayment"}
            </button>
          </form>
        </section>

        <section className="client-list-card" aria-labelledby="history-heading">
          <div className="section-heading"><div><h2 id="history-heading">Repayment history</h2><p>{visibleHistory ? `${visibleHistory.loanNumber} · ${visibleHistory.clientName}` : "Payments for the selected loan"}</p></div></div>
          {isHistoryLoading ? <p className="list-placeholder">Loading repayment history…</p> : historyError ? <p className="list-placeholder error-message" role="alert">{historyError}</p> : !visibleHistory || visibleHistory.repayments.length === 0 ? (
            <div className="list-empty"><span className="list-empty-icon">↙</span><strong>No repayments recorded</strong><p>This loan’s payments will appear here.</p></div>
          ) : (
            <ul className="repayment-list">
              {visibleHistory.repayments.map((repayment) => (
                <li className="repayment-row" key={repayment.paymentReference}>
                  <span className="repayment-icon">↙</span>
                  <span className="client-details"><strong>{repayment.paymentReference}</strong><small>{formatDate(repayment.createdAt)}</small><small>KES {formatMoney(repayment.balanceBefore)} → KES {formatMoney(repayment.balanceAfter)}</small></span>
                  <span className="repayment-amount">− KES {formatMoney(repayment.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
