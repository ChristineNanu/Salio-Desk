import Link from "next/link";
import { db } from "@/lib/db";
import { getOverview } from "@/lib/overview";

export const dynamic = "force-dynamic";

function formatMoney(minorUnits: number) {
  return new Intl.NumberFormat("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(minorUnits / 100);
}

function formatDate(value: string) {
  return new Date(`${value.replace(" ", "T")}Z`).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  });
}

export default function Home() {
  const overview = getOverview(db);
  const currentDate = new Intl.DateTimeFormat("en-KE", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date()).toUpperCase();

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
            Overview
          </Link>
          <Link className="nav-link" href="/clients">
            Clients
          </Link>
          <Link className="nav-link" href="/loans">
            Loans
          </Link>
          <Link className="nav-link" href="/repayments">
            Repayments
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <Link className="help-card" href="/guide">
            <span className="help-mark">?</span>
            <div><strong>Need a hand?</strong><span>View the quick guide</span></div>
          </Link>
          <div className="workspace-status">
            <span className="workspace-status-dot" />
            <div><strong>Local workspace</strong><span>KES currency</span></div>
          </div>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumbs">Workspace <span>/</span> Overview</div>
          <div className="topbar-right">
            <span className="today-label">{currentDate}</span>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">LOAN PORTFOLIO</p>
              <h1>Portfolio overview</h1>
              <p className="welcome-copy">Balances and payments recorded at this desk.</p>
            </div>
            <Link className="primary-button" href="/loans">Create loan</Link>
          </div>

          <div className="stats-grid" aria-label="Loan overview">
            <article className="stat-card">
              <div className="stat-heading">Active loans</div>
              <div className="stat-value">{overview.activeLoans}</div>
              <div className="stat-note">Loans currently being repaid</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading">Outstanding balance</div>
              <div className="stat-value stat-money">KES {formatMoney(overview.totalOutstanding)}</div>
              <div className="stat-note">Across all active loans</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading">Payments this month</div>
              <div className="stat-value">{overview.paymentsThisMonth}</div>
              <div className="stat-note">This month</div>
            </article>
          </div>

          <section className="activity-card" aria-labelledby="activity-heading">
            <div className="section-heading">
              <div><h2 id="activity-heading">Recent loan activity</h2><p>Loans opened and repayments recorded</p></div>
              <Link className="text-button" href="/repayments">View repayments <span>→</span></Link>
            </div>
            {overview.recentActivity.length === 0 ? <div className="empty-state">
              <h3>No loan activity yet</h3>
              <p>{overview.clientCount === 0 ? "Add a client to get your desk started." : "Create a loan or record a repayment to see recent activity here."}</p>
              <Link className="secondary-button" href={overview.clientCount === 0 ? "/clients" : "/loans"}>{overview.clientCount === 0 ? "Register a client" : "Create a loan"}</Link>
            </div> : <ul className="activity-list">
              {overview.recentActivity.map((activity) => (
                <li className="activity-row" key={`${activity.type}-${activity.reference}`}>
                  <span className="client-details"><strong>{activity.clientName}</strong><small>{activity.type === "repayment" ? "Payment" : "Loan"} · {activity.reference} · {formatDate(activity.createdAt)}</small></span>
                  <span className="activity-amount">{activity.type === "repayment" ? "− " : ""}KES {formatMoney(activity.amount)}</span>
                </li>
              ))}
            </ul>}
          </section>

          <footer className="footer-note">Outstanding balances are calculated from recorded repayments.</footer>
        </div>
      </section>
    </main>
  );
}
