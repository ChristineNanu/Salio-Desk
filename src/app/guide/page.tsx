import Link from "next/link";

export default function GuidePage() {
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
          <Link className="nav-link" href="/loans"><span className="nav-icon">▤</span> Loans</Link>
          <Link className="nav-link" href="/repayments"><span className="nav-icon">↙</span> Repayments</Link>
        </nav>
        <div className="sidebar-bottom">
          <Link className="help-card" href="/guide" aria-current="page"><span className="help-mark">?</span><div><strong>Need a hand?</strong><span>View the quick guide</span></div></Link>
          <div className="staff-profile"><span className="avatar">JD</span><span className="staff-name">Desk staff</span><span className="profile-menu">•••</span></div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs"><Link href="/">Workspace</Link><span>/</span> Quick guide</div>
          <div className="topbar-right"><span className="today-label">SALIO DESK HELP</span></div>
        </header>
        <div className="content">
          <div className="welcome-row">
            <div><p className="eyebrow">A SHORT WALKTHROUGH</p><h1>Quick guide</h1><p className="welcome-copy">Follow these steps to register a client, set up a loan, and record payments.</p></div>
          </div>

          <section className="guide-card" aria-labelledby="workflow-heading">
            <div className="section-heading"><div><h2 id="workflow-heading">The usual workflow</h2><p>Start with a client, then create a loan before taking repayments.</p></div></div>
            <ol className="guide-steps">
              <li><span className="guide-number">1</span><div><h3>Register a client</h3><p>Open Clients and add the person’s name and phone number. Salio Desk assigns a client number.</p><Link href="/clients">Go to clients <span>→</span></Link></div></li>
              <li><span className="guide-number">2</span><div><h3>Create a loan</h3><p>Open Loans, select the client, and enter the original loan amount and total amount due. A loan number is assigned automatically.</p><Link href="/loans">Go to loans <span>→</span></Link></div></li>
              <li><span className="guide-number">3</span><div><h3>Record a repayment</h3><p>Open Repayments, choose the loan, then enter the amount received and the payment reference from the receipt or payment service.</p><Link href="/repayments">Go to repayments <span>→</span></Link></div></li>
            </ol>
          </section>

          <section className="guide-rules" aria-labelledby="rules-heading">
            <div className="guide-rules-icon">!</div>
            <div><h2 id="rules-heading">Why might a payment be rejected?</h2><p>Salio Desk keeps the repayment history accurate. It won’t save a payment if:</p>
              <ul>
                <li>the amount is zero or less;</li>
                <li>the payment reference has already been used;</li>
                <li>the selected loan can’t be found; or</li>
                <li>the payment is larger than the loan’s outstanding balance.</li>
              </ul>
              <p>If a payment is rejected, it is not added to the history and the balance stays the same.</p>
            </div>
          </section>

          <footer className="footer-note"><span className="secure-dot" /> The overview updates from the records saved on this desk.</footer>
        </div>
      </section>
    </main>
  );
}
