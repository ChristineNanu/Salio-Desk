import Link from "next/link";

export default function Home() {
  return (
    <main className="desk-shell">
      <aside className="sidebar" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="Salio Desk home">
          <span className="brand-mark">S</span>
          <span>salio<span className="brand-light">desk</span></span>
        </Link>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="navigation">
          <Link className="nav-link active" href="/" aria-current="page">
            <span className="nav-icon">▦</span> Overview
          </Link>
          <Link className="nav-link" href="/clients">
            <span className="nav-icon">♙</span> Clients
          </Link>
          <Link className="nav-link" href="/loans">
            <span className="nav-icon">▤</span> Loans
          </Link>
          <Link className="nav-link" href="/repayments">
            <span className="nav-icon">↙</span> Repayments
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <span className="help-mark">?</span>
            <div><strong>Need a hand?</strong><span>View the quick guide</span></div>
          </div>
          <div className="staff-profile">
            <span className="avatar">JD</span>
            <span className="staff-name">Desk staff</span>
            <span className="profile-menu">•••</span>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> Overview</div>
          <div className="topbar-right">
            <span className="today-label">MONDAY, 02 NOV 2026</span>
            <button className="icon-button" aria-label="Notifications">♧<i /></button>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR LOAN DESK</p>
              <h1>Good morning</h1>
              <p className="welcome-copy">Here’s what’s happening with your clients today.</p>
            </div>
            <Link className="primary-button" href="/loans"><span>＋</span> New loan</Link>
          </div>

          <div className="stats-grid" aria-label="Loan overview">
            <article className="stat-card">
              <div className="stat-heading">Active loans <span className="stat-icon violet">▤</span></div>
              <div className="stat-value">—</div>
              <div className="stat-note">Loans currently being repaid</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading">Total outstanding <span className="stat-icon green">↗</span></div>
              <div className="stat-value">—</div>
              <div className="stat-note">Across all active loans</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading">Payments recorded <span className="stat-icon amber">↙</span></div>
              <div className="stat-value">—</div>
              <div className="stat-note">This month</div>
            </article>
          </div>

          <section className="activity-card" aria-labelledby="activity-heading">
            <div className="section-heading">
              <div><h2 id="activity-heading">Recent activity</h2><p>Your latest loan and repayment updates</p></div>
              <button className="text-button" type="button">View all <span>→</span></button>
            </div>
            <div className="empty-state">
              <div className="empty-illustration" aria-hidden="true">
                <div className="paper paper-back" /><div className="paper paper-front"><span /><span /><span /></div>
                <div className="empty-sparkle">✦</div>
              </div>
              <h3>Your desk is ready</h3>
              <p>Once you add a client or record a loan, activity will show up here.</p>
              <Link className="secondary-button" href="/clients"><span>＋</span> Add your first client</Link>
            </div>
          </section>

          <footer className="footer-note"><span className="secure-dot" /> Your records are kept clear and up to date.</footer>
        </div>
      </section>
    </main>
  );
}
