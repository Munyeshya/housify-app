export function formatMoney(value, currency = "RWF") {
  const amount = Number(value || 0)

  return new Intl.NumberFormat("en-RW", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount)
}

export function formatLabel(value = "") {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export function formatDate(value, options = {}) {
  if (!value) {
    return "Not available"
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("en-RW", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(date)
}

export function getPaymentReminderDetails(payment) {
  if (!payment || !payment.due_date || !["pending", "partial"].includes(payment.status)) {
    return null
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dueDate = new Date(payment.due_date)
  dueDate.setHours(0, 0, 0, 0)

  if (Number.isNaN(dueDate.getTime())) {
    return null
  }

  const millisecondsInDay = 1000 * 60 * 60 * 24
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / millisecondsInDay)

  if (daysUntilDue < 0) {
    return {
      message: "This payment is overdue. Clear it now so the balance stops carrying as an unpaid rent entry.",
      tone: "danger",
      title: `Payment overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"}`,
    }
  }

  if (daysUntilDue <= 7) {
    return {
      message: "The due date is within the next week. This reminder will disappear as soon as the payment is fully recorded.",
      tone: "warning",
      title: `Payment due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`,
    }
  }

  return null
}

export function TenantWorkspacePage({ eyebrow, title, lede, actions, children }) {
  return (
    <div className="tenant-page">
      <header className="tenant-page__header">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
          {lede ? <p className="lede">{lede}</p> : null}
        </div>
        {actions ? <div className="tenant-page__actions">{actions}</div> : null}
      </header>
      <div className="tenant-page__stack">{children}</div>
    </div>
  )
}

export function TenantPanel({ title, eyebrow, actions, children }) {
  return (
    <section className="tenant-panel">
      {(title || eyebrow || actions) ? (
        <div className="tenant-panel__header">
          <div>
            {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
            {title ? <h3>{title}</h3> : null}
          </div>
          {actions ? <div className="tenant-panel__actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function TenantEmptyState({ message }) {
  return <div className="tenant-empty-state">{message}</div>
}

export function TenantDataList({ items, renderItem }) {
  return <div className="tenant-data-list">{items.map(renderItem)}</div>
}
