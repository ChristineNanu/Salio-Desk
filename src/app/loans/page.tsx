import Link from "next/link";
import { LoanDirectory } from "@/components/loans/loan-directory";

export default function LoansPage() {
  return (
    <main className="desk-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Salio Desk home">
          <span className="brand-mark">S</span>
          <span>salio<span className="brand-light">desk</span></span>
        </Link>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">
          <Link className="nav-link" href="/">Overview</Link>
          <Link className="nav-link" href="/clients">Clients</Link>
          <Link className="nav-link active" href="/loans" aria-current="page">Loans</Link>
          <Link className="nav-link" href="/repayments">Repayments</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link className="help-card" href="/guide"><span className="help-mark">?</span><div><strong>Need a hand?</strong><span>View the quick guide</span></div></Link>
          <div className="workspace-status"><span className="workspace-status-dot" /><div><strong>Local workspace</strong><span>SQLite · KES</span></div></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><Link href="/">Workspace</Link><span>/</span> Loans</div>
          <div className="topbar-right"><span className="today-label">LOAN REGISTER</span></div>
        </header>
        <div className="content">
          <LoanDirectory />
          <footer className="footer-note">Amounts are stored as whole cents to avoid rounding errors.</footer>
        </div>
      </section>
    </main>
  );
}
