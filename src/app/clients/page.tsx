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
          <Link className="nav-link" href="/">Overview</Link>
          <Link className="nav-link active" href="/clients" aria-current="page">Clients</Link>
          <Link className="nav-link" href="/loans">Loans</Link>
          <Link className="nav-link" href="/repayments">Repayments</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link className="help-card" href="/guide"><span className="help-mark">?</span><div><strong>Need a hand?</strong><span>View the quick guide</span></div></Link>
          <div className="workspace-status"><span className="workspace-status-dot" /><div><strong>Local workspace</strong><span>KES currency</span></div></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><Link href="/">Workspace</Link><span>/</span> Clients</div>
          <div className="topbar-right"><span className="today-label">CLIENT DIRECTORY</span></div>
        </header>
        <div className="content">
          <ClientDirectory />
          <footer className="footer-note">Client details are saved on this desk.</footer>
        </div>
      </section>
    </main>
  );
}
