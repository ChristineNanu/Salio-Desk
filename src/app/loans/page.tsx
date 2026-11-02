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
          <Link className="nav-link" href="/"><span className="nav-icon">▦</span> Overview</Link>
          <Link className="nav-link" href="/clients"><span className="nav-icon">♙</span> Clients</Link>
          <Link className="nav-link active" href="/loans" aria-current="page"><span className="nav-icon">▤</span> Loans</Link>
          <Link className="nav-link" href="/repayments"><span className="nav-icon">↙</span> Repayments</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link className="help-card" href="/guide"><span className="help-mark">?</span><div><strong>Need a hand?</strong><span>View the quick guide</span></div></Link>
          <div className="staff-profile"><span className="avatar">JD</span><span className="staff-name">Desk staff</span><span className="profile-menu">•••</span></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><Link href="/">Workspace</Link><span>/</span> Loans</div>
          <div className="topbar-right"><span className="today-label">LOAN REGISTER</span></div>
        </header>
        <div className="content">
          <LoanDirectory />
          <footer className="footer-note"><span className="secure-dot" /> Amounts are stored as whole cents to avoid rounding errors.</footer>
        </div>
      </section>
    </main>
  );
}
