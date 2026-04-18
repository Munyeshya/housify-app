import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { dashboardsApi, paymentsApi } from "../../services/api"
import { getPaginationMeta, unwrapResults } from "../../services/api/response"
import {
  buildComplaintCards,
  buildPaymentCards,
  DashboardActionGrid,
  DashboardError,
  DashboardHero,
  DashboardLoading,
  DashboardSection,
  DashboardSnapshotGrid,
  DashboardStatGrid,
} from "../../components/dashboard/DashboardBlocks"
import { getPaymentReminderDetails } from "../../components/tenant/TenantWorkspaceBlocks"
import { AlertIcon, CreditCardIcon, WalletIcon } from "../../components/common/Icons"

const paymentMethodOptions = [
  { label: "Mobile money", value: "mobile_money" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Other", value: "other" },
]

function formatMoney(value, currency = "RWF") {
  const amount = Number(value || 0)

  return new Intl.NumberFormat("en-RW", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount)
}

function TenantDashboard() {
  const [data, setData] = useState(null)
  const [payments, setPayments] = useState([])
  const [paymentMeta, setPaymentMeta] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    method: "mobile_money",
    notes: "",
    reference: "",
  })

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const [dashboardResponse, paymentsResponse] = await Promise.all([
          dashboardsApi.getTenantDashboard(),
          paymentsApi.list(),
        ])
        if (isMounted) {
          setData(dashboardResponse)
          setPayments(unwrapResults(paymentsResponse))
          setPaymentMeta(getPaginationMeta(paymentsResponse))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load your tenant dashboard.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const payableRent = payments
    .filter((payment) => payment.category === "rent" && ["pending", "partial"].includes(payment.status))
    .sort((left, right) => {
      const leftDate = left.due_date ? new Date(left.due_date).getTime() : 0
      const rightDate = right.due_date ? new Date(right.due_date).getTime() : 0
      return leftDate - rightDate
    })[0]

  const recentPayments = payments.slice(0, 5)
  const paymentReminder = useMemo(() => getPaymentReminderDetails(payableRent), [payableRent])

  function handlePaymentFieldChange(event) {
    const { name, value } = event.target
    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function refreshTenantWorkspace() {
    const [dashboardResponse, paymentsResponse] = await Promise.all([
      dashboardsApi.getTenantDashboard(),
      paymentsApi.list(),
    ])
    setData(dashboardResponse)
    setPayments(unwrapResults(paymentsResponse))
    setPaymentMeta(getPaginationMeta(paymentsResponse))
  }

  async function handleTenantPaymentSubmit(event) {
    event.preventDefault()

    if (!payableRent) {
      toast.error("There is no open rent entry to apply this payment to right now.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await paymentsApi.submitTenantPayment({
        amount: paymentForm.amount,
        method: paymentForm.method,
        notes: paymentForm.notes,
        reference: paymentForm.reference,
        tenancy: payableRent.tenancy,
      })

      await refreshTenantWorkspace()
      setPaymentForm({
        amount: "",
        method: paymentForm.method,
        notes: "",
        reference: "",
      })

      if (response.created_future_payment_count > 0) {
        toast.success(
          `Payment recorded. Overflow was carried into ${response.created_future_payment_count} future month${response.created_future_payment_count > 1 ? "s" : ""}.`,
        )
      } else {
        toast.success("Payment recorded successfully.")
      }
    } catch (error) {
      toast.error(error.message || "Unable to record this payment.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <DashboardLoading />
  }

  if (!data) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <div className="dashboard-stack">
      <DashboardHero
        accent={data.has_legal_document ? "ID document on file" : "No legal document uploaded yet"}
        eyebrow="Tenant workspace"
        lede="Track what is due, submit rent, and keep a clean view of your current residence and saved homes."
        title="Manage your tenancy from one clean workspace."
      />

      <DashboardSection eyebrow="Overview" title="Your rental activity">
        <DashboardStatGrid
          items={[
            { label: "saved homes", value: data.saved_property_count },
            { label: "current tenancy", value: data.current_tenancy_count },
            { label: "past tenancies", value: data.past_tenancy_count },
            { label: "legal document", value: data.has_legal_document ? 1 : 0 },
          ]}
        />
      </DashboardSection>

      {paymentReminder ? (
        <section
          className={
            paymentReminder.tone === "danger"
              ? "tenant-reminder-banner tenant-reminder-banner--danger"
              : "tenant-reminder-banner tenant-reminder-banner--warning"
          }
        >
          <div className="tenant-reminder-banner__icon">
            <AlertIcon className="ui-icon" />
          </div>
          <div>
            <strong>{paymentReminder.title}</strong>
            <p>{paymentReminder.message}</p>
          </div>
        </section>
      ) : null}

      <section className="tenant-dashboard-grid">
        <article className="tenant-payment-panel">
          <div className="tenant-payment-panel__header">
            <div>
              <p className="eyebrow">Rent payment</p>
              <h3>Pay against your current tenancy</h3>
            </div>
            <div className="tenant-payment-panel__icon">
              <WalletIcon className="ui-icon" />
            </div>
          </div>

          {payableRent ? (
            <>
              <div className="tenant-payment-panel__summary">
                <div>
                  <span>Next due</span>
                  <strong>{payableRent.due_date || "Not scheduled"}</strong>
                </div>
                <div>
                  <span>Outstanding</span>
                  <strong>{formatMoney(payableRent.outstanding_balance, payableRent.currency)}</strong>
                </div>
                <div>
                  <span>Property</span>
                  <strong>{payableRent.property_title}</strong>
                </div>
              </div>

              <form className="tenant-payment-form" onSubmit={handleTenantPaymentSubmit}>
                <label>
                  Amount
                  <input
                    className="form-control"
                    min="0"
                    name="amount"
                    onChange={handlePaymentFieldChange}
                    placeholder="Enter amount"
                    step="0.01"
                    type="number"
                    value={paymentForm.amount}
                  />
                </label>

                <label>
                  Payment method
                  <select
                    className="form-control"
                    name="method"
                    onChange={handlePaymentFieldChange}
                    value={paymentForm.method}
                  >
                    {paymentMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Reference
                  <input
                    className="form-control"
                    name="reference"
                    onChange={handlePaymentFieldChange}
                    placeholder="Transaction or transfer reference"
                    type="text"
                    value={paymentForm.reference}
                  />
                </label>

                <label className="tenant-payment-form__full">
                  Notes
                  <textarea
                    className="form-control"
                    name="notes"
                    onChange={handlePaymentFieldChange}
                    placeholder="Optional note for this payment"
                    rows="3"
                    value={paymentForm.notes}
                  />
                </label>

                <div className="tenant-payment-form__footer">
                  <div className="tenant-payment-form__hint">
                    <AlertIcon className="ui-icon ui-icon--muted" />
                    <span>Any overpayment automatically carries into the next rent cycle.</span>
                  </div>
                  <button
                    className="btn btn-dark"
                    disabled={isSubmitting || !paymentForm.amount}
                    type="submit"
                  >
                    <CreditCardIcon className="ui-icon" />
                    {isSubmitting ? "Recording..." : "Record payment"}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="tenant-payment-panel__empty">
              <p>No pending or partial rent entry is open right now.</p>
            </div>
          )}
        </article>

        <article className="tenant-activity-panel">
          <div className="tenant-activity-panel__header">
            <div>
              <p className="eyebrow">Recent payment records</p>
              <h3>See what has already been logged</h3>
            </div>
            {paymentMeta ? <span>{paymentMeta.count} records</span> : null}
          </div>

          <div className="tenant-activity-list">
            {recentPayments.length ? (
              recentPayments.map((payment) => (
                <article className="tenant-activity-row" key={payment.id}>
                  <div className="tenant-activity-row__icon">
                    <CreditCardIcon className="ui-icon" />
                  </div>
                  <div className="tenant-activity-row__body">
                    <strong>{payment.property_title}</strong>
                    <span>
                      {payment.status} · due {payment.due_date || "pending"}
                    </span>
                  </div>
                  <div className="tenant-activity-row__meta">
                    <strong>{formatMoney(payment.amount_paid, payment.currency)}</strong>
                    <span>{payment.method.replace(/_/g, " ")}</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="tenant-activity-panel__empty">No payment records are available yet.</p>
            )}
          </div>
        </article>
      </section>

      <DashboardSection eyebrow="Activity" title="Payments and complaints">
        <DashboardSnapshotGrid
          cards={[
            buildPaymentCards(data.payment_snapshot),
            buildComplaintCards(data.complaint_snapshot),
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Functions" title="What you can follow here">
        <DashboardActionGrid
          items={[
            {
              body: "Check how many homes you have saved and whether your current housing activity is still active.",
              eyebrow: "Bookmarks",
              title: "Keep your shortlist close",
            },
            {
              body: "Submit rent from inside the workspace and let extra payments roll ahead into the next billing cycle.",
              eyebrow: "Payments",
              title: "Pay and track your rent here",
            },
            {
              body: "Confirm whether your identification document is already on file for verification and access workflows.",
              eyebrow: "Documents",
              title: "Know your document status",
            },
          ]}
        />
      </DashboardSection>
    </div>
  )
}

export default TenantDashboard
