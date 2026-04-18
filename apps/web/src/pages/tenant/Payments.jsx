import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  formatDate,
  formatLabel,
  formatMoney,
  getPaymentReminderDetails,
  TenantDataList,
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { AlertIcon, CalendarIcon, CreditCardIcon, WalletIcon } from "../../components/common/Icons"
import { paymentsApi } from "../../services/api"
import { getPaginationMeta, unwrapResults } from "../../services/api/response"

const paymentMethodOptions = [
  { label: "Mobile money", value: "mobile_money" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Other", value: "other" },
]

function Payments() {
  const [payments, setPayments] = useState([])
  const [meta, setMeta] = useState(null)
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

    async function loadPayments() {
      try {
        const response = await paymentsApi.list()
        if (isMounted) {
          setPayments(unwrapResults(response))
          setMeta(getPaginationMeta(response))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load payment activity.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPayments()

    return () => {
      isMounted = false
    }
  }, [])

  const payableRent = useMemo(
    () =>
      payments
        .filter((payment) => payment.category === "rent" && ["pending", "partial"].includes(payment.status))
        .sort((left, right) => {
          const leftDate = left.due_date ? new Date(left.due_date).getTime() : 0
          const rightDate = right.due_date ? new Date(right.due_date).getTime() : 0
          return leftDate - rightDate
        })[0] || null,
    [payments],
  )

  const orderedPayments = useMemo(
    () =>
      [...payments].sort((left, right) => {
        const leftDate = left.due_date ? new Date(left.due_date).getTime() : 0
        const rightDate = right.due_date ? new Date(right.due_date).getTime() : 0
        return rightDate - leftDate
      }),
    [payments],
  )

  const totals = useMemo(() => {
    const paid = payments.reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0)
    const outstanding = payments.reduce(
      (sum, payment) => sum + Number(payment.outstanding_balance || 0),
      0,
    )
    const pendingCount = payments.filter((payment) =>
      ["pending", "partial"].includes(payment.status),
    ).length

    return { paid, outstanding, pendingCount }
  }, [payments])

  const paymentReminder = useMemo(() => getPaymentReminderDetails(payableRent), [payableRent])

  async function refreshPayments() {
    const response = await paymentsApi.list()
    setPayments(unwrapResults(response))
    setMeta(getPaginationMeta(response))
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setPaymentForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handlePaymentSubmit(event) {
    event.preventDefault()

    if (!payableRent) {
      toast.error("There is no open rent entry to apply a payment to right now.")
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

      await refreshPayments()
      setPaymentForm((current) => ({
        ...current,
        amount: "",
        notes: "",
        reference: "",
      }))

      if (response.created_future_payment_count > 0) {
        toast.success(
          `Payment recorded. Extra funds moved into ${response.created_future_payment_count} future month${response.created_future_payment_count > 1 ? "s" : ""}.`,
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

  if (errorMessage) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <TenantWorkspacePage
      eyebrow="Payments"
      lede="See your full rent ledger, submit payments against the current tenancy, and follow any carry-forward created by overpayment."
      title="Rent payments and ledger"
    >
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

      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <WalletIcon className="ui-icon" />
          </div>
          <div>
            <span>Total paid</span>
            <strong>{formatMoney(totals.paid)}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <AlertIcon className="ui-icon" />
          </div>
          <div>
            <span>Outstanding</span>
            <strong>{formatMoney(totals.outstanding)}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <CreditCardIcon className="ui-icon" />
          </div>
          <div>
            <span>Open entries</span>
            <strong>{totals.pendingCount}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <CalendarIcon className="ui-icon" />
          </div>
          <div>
            <span>Ledger records</span>
            <strong>{meta?.count || payments.length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Record payment" title="Pay against your current tenancy">
          {payableRent ? (
            <>
              <div className="tenant-payment-panel__summary">
                <div>
                  <span>Next due</span>
                  <strong>{formatDate(payableRent.due_date)}</strong>
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

              <form className="tenant-payment-form" onSubmit={handlePaymentSubmit}>
                <label>
                  Amount
                  <input
                    className="form-control"
                    min="0"
                    name="amount"
                    onChange={handleFieldChange}
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
                    onChange={handleFieldChange}
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
                    onChange={handleFieldChange}
                    placeholder="Transaction or transfer reference"
                    type="text"
                    value={paymentForm.reference}
                  />
                </label>

                <label>
                  Carry-forward behavior
                  <input
                    className="form-control"
                    disabled
                    type="text"
                    value="Extra payment automatically rolls into future rent."
                  />
                </label>

                <label className="tenant-payment-form__full">
                  Notes
                  <textarea
                    className="form-control"
                    name="notes"
                    onChange={handleFieldChange}
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
            <TenantEmptyState message="No pending or partial rent entry is open right now." />
          )}
        </TenantPanel>

        <TenantPanel eyebrow="Current payment window" title="What this payment will affect">
          {payableRent ? (
            <div className="tenant-detail-card">
              <div className="tenant-detail-card__header">
                <div>
                  <h4>{payableRent.property_title}</h4>
                  <p>{formatLabel(payableRent.method || "payment")}</p>
                </div>
                <span className={`tenant-status-pill tenant-status-pill--${payableRent.status}`}>
                  {formatLabel(payableRent.status)}
                </span>
              </div>

              <div className="tenant-detail-grid">
                <article>
                  <span>Due date</span>
                  <strong>{formatDate(payableRent.due_date)}</strong>
                </article>
                <article>
                  <span>Amount due</span>
                  <strong>{formatMoney(payableRent.amount_due, payableRent.currency)}</strong>
                </article>
                <article>
                  <span>Already paid</span>
                  <strong>{formatMoney(payableRent.amount_paid, payableRent.currency)}</strong>
                </article>
                <article>
                  <span>Outstanding</span>
                  <strong>{formatMoney(payableRent.outstanding_balance, payableRent.currency)}</strong>
                </article>
                <article>
                  <span>Verification</span>
                  <strong>{formatLabel(payableRent.verification_status || "pending")}</strong>
                </article>
                <article>
                  <span>Reference</span>
                  <strong>{payableRent.reference || "Not added yet"}</strong>
                </article>
              </div>
            </div>
          ) : (
            <TenantEmptyState message="There is no open payment entry linked to your current tenancy." />
          )}
        </TenantPanel>
      </section>

      <TenantPanel eyebrow="Payment history" title="Full payment ledger">
        {orderedPayments.length ? (
          <TenantDataList
            items={orderedPayments}
            renderItem={(payment) => (
              <article className="tenant-record-row" key={payment.id}>
                <div className="tenant-record-row__icon">
                  <CreditCardIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{payment.property_title}</strong>
                  <span>
                    {formatLabel(payment.category)} · due {formatDate(payment.due_date)}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <strong>{formatMoney(payment.amount_paid, payment.currency)}</strong>
                  <span className={`tenant-status-pill tenant-status-pill--${payment.status}`}>
                    {formatLabel(payment.status)}
                  </span>
                </div>
              </article>
            )}
          />
        ) : (
          <TenantEmptyState message="No payment records are available yet." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default Payments
