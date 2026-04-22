/* eslint-disable react-refresh/only-export-components */

function formatLabel(label) {
  return label.replace(/_/g, " ")
}

function formatMoneyValue(value) {
  const numericValue = Number(value || 0)

  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(numericValue)
}

export function DashboardHero({ eyebrow, title, lede, accent }) {
  return (
    <section className="dashboard-hero">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lede">{lede}</p>
      </div>
      {accent ? <div className="dashboard-hero__accent">{accent}</div> : null}
    </section>
  )
}

export function DashboardStatGrid({ items }) {
  return (
    <div className="dashboard-stat-grid">
      {items.map((item) => (
        <article className="dashboard-stat-card" key={item.label}>
          <span>{formatLabel(item.label)}</span>
          <strong>{item.value}</strong>
        </article>
      ))}
    </div>
  )
}

export function DashboardSection({ children, eyebrow, title }) {
  return (
    <section className="dashboard-section">
      <div className="dashboard-section__heading">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  )
}

export function DashboardSnapshotGrid({ cards }) {
  return (
    <div className="dashboard-snapshot-grid">
      {cards.map((card) => (
        <article className="dashboard-snapshot-card" key={card.title}>
          <div className="dashboard-snapshot-card__header">
            <span>{card.title}</span>
            {card.value ? <strong>{card.value}</strong> : null}
          </div>
          <div className="dashboard-snapshot-card__rows">
            {card.rows.map((row) => (
              <div className="dashboard-snapshot-card__row" key={row.label}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}

export function DashboardActionGrid({ items }) {
  return (
    <div className="dashboard-action-grid">
      {items.map((item) => (
        <article className="dashboard-action-card" key={item.title}>
          <span>{item.eyebrow}</span>
          <h4>{item.title}</h4>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  )
}

export function DashboardLoading() {
  return (
    <section className="dashboard-loading page-panel">
      <p className="eyebrow">Loading</p>
      <h2>Preparing your workspace.</h2>
      <p className="lede">We are pulling the latest dashboard data for this account.</p>
    </section>
  )
}

export function DashboardError({ message }) {
  return (
    <section className="dashboard-loading page-panel">
      <p className="eyebrow">Unavailable</p>
      <h2>We could not load this dashboard right now.</h2>
      <p className="lede">{message}</p>
    </section>
  )
}

export function buildPaymentCards(snapshot) {
  return {
    rows: [
      { label: "Pending", value: snapshot.pending_count },
      { label: "Paid", value: snapshot.paid_count },
      { label: "Partial", value: snapshot.partial_count },
      { label: "Outstanding", value: formatMoneyValue(snapshot.outstanding_balance) },
    ],
    title: "Payments",
    value: formatMoneyValue(snapshot.total_paid),
  }
}

export function buildComplaintCards(snapshot) {
  return {
    rows: [
      { label: "Open", value: snapshot.open },
      { label: "In review", value: snapshot.in_review },
      { label: "Escalated", value: snapshot.escalated },
      { label: "Resolved", value: snapshot.resolved },
      { label: "Closed", value: snapshot.closed },
    ],
    title: "Complaints",
    value: snapshot.total,
  }
}
