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

function getGreeting(date = new Date()) {
  const hour = Number(new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hourCycle: "h23",
    timeZone: "Africa/Nairobi",
  }).format(date));

  if (hour < 12) return "Good morning";
  if (hour < 16) return "Good afternoon";
  return "Good evening";
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
          <Link className="help-card" href="/guide">
            <span className="help-mark">?</span>
            <div><strong>Need a hand?</strong><span>View the quick guide</span></div>
          </Link>
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
            <span className="today-label">{currentDate}</span>
            <button className="icon-button" aria-label="Notifications">♧<i /></button>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR LOAN DESK</p>
              <h1>{getGreeting()}</h1>
              <p className="welcome-copy">Here’s what’s happening with your clients today.</p>
            </div>
            <Link className="primary-button" href="/loans"><span>＋</span> New loan</Link>
          </div>

          <div className="stats-grid" aria-label="Loan overview">
            <article className="stat-card">
              <div className="stat-heading">Active loans <span className="stat-icon violet">▤</span></div>
              <div className="stat-value">{overview.activeLoans}</div>
              <div className="stat-note">Loans currently being repaid</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading">Total outstanding <span className="stat-icon green">↗</span></div>
              <div className="stat-value stat-money">KES {formatMoney(overview.totalOutstanding)}</div>
              <div className="stat-note">Across all active loans</div>
            </article>
            <article className="stat-card">
              <div className="stat-heading">Payments recorded <span className="stat-icon amber">↙</span></div>
              <div className="stat-value">{overview.paymentsThisMonth}</div>
              <div className="stat-note">This month</div>
            </article>
          </div>

          <section className="activity-card" aria-labelledby="activity-heading">
            <div className="section-heading">
              <div><h2 id="activity-heading">Recent activity</h2><p>Your latest loan and repayment updates</p></div>
              <Link className="text-button" href="/repayments">View all <span>→</span></Link>
            </div>
            {overview.recentActivity.length === 0 ? <div className="empty-state">
              <div className="empty-illustration" aria-hidden="true">
                <div className="paper paper-back" /><div className="paper paper-front"><span /><span /><span /></div>
                <div className="empty-sparkle">✦</div>
              </div>
              <h3>Your desk is ready</h3>
              <p>{overview.clientCount === 0 ? "Add a client to get your desk started." : "Create a loan or record a repayment to see recent activity here."}</p>
              <Link className="secondary-button" href={overview.clientCount === 0 ? "/clients" : "/loans"}><span>＋</span> {overview.clientCount === 0 ? "Add your first client" : "Create a loan"}</Link>
            </div> : <ul className="activity-list">
              {overview.recentActivity.map((activity) => (
                <li className="activity-row" key={`${activity.type}-${activity.reference}`}>
                  <span className={`activity-icon ${activity.type === "repayment" ? "activity-payment" : "activity-loan"}`}>{activity.type === "repayment" ? "↙" : "▤"}</span>
                  <span className="client-details"><strong>{activity.clientName}</strong><small>{activity.type === "repayment" ? "Payment" : "Loan"} · {activity.reference} · {formatDate(activity.createdAt)}</small></span>
                  <span className="activity-amount">{activity.type === "repayment" ? "− " : ""}KES {formatMoney(activity.amount)}</span>
                </li>
              ))}
            </ul>}
          </section>

          <footer className="footer-note"><span className="secure-dot" /> Your records are kept clear and up to date.</footer>
        </div>
      </section>
    </main>
  );
}
