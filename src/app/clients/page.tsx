import Link from "next/link";
import { ClientDirectory } from "@/components/clients/client-directory";

export default function ClientsPage() {
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
          <Link className="nav-link active" href="/clients" aria-current="page"><span className="nav-icon">♙</span> Clients</Link>
          <Link className="nav-link" href="/loans"><span className="nav-icon">▤</span> Loans</Link>
          <Link className="nav-link" href="/repayments"><span className="nav-icon">↙</span> Repayments</Link>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-mark">?</span><div><strong>Need a hand?</strong><span>View the quick guide</span></div></div>
          <div className="staff-profile"><span className="avatar">JD</span><span className="staff-name">Desk staff</span><span className="profile-menu">•••</span></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><Link href="/">Workspace</Link><span>/</span> Clients</div>
          <div className="topbar-right"><span className="today-label">CLIENT DIRECTORY</span></div>
        </header>
        <div className="content">
          <ClientDirectory />
          <footer className="footer-note"><span className="secure-dot" /> Client details are stored in your local SQLite database.</footer>
        </div>
      </section>
    </main>
  );
}
