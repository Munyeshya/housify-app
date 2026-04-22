import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { CreditCardIcon, WalletIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
  formatMoney,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { paymentsApi, tenanciesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

const paymentCategoryOptions = [
  { label: "Rent", value: "rent" },
  { label: "Deposit", value: "deposit" },
  { label: "Service charge", value: "service_charge" },
  { label: "Late fee", value: "late_fee" },
  { label: "Other", value: "other" },
]

const paymentStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
]

const paymentMethodOptions = [
  { label: "Mobile money", value: "mobile_money" },
  { label: "Bank transfer", value: "bank_transfer" },
  { label: "Cash", value: "cash" },
  { label: "Card", value: "card" },
  { label: "Other", value: "other" },
]

function createPaymentForm() {
  return {
    amount_due: "",
    amount_paid: "",
    category: "rent",
    due_date: "",
    method: "bank_transfer",
    notes: "",
    reference: "",
    status: "pending",
    tenancy: "",
  }
}

function createAdjustmentForm() {
  return {
    adjustment_type: "correction",
    amount_delta: "",
    payment: "",
    reason: "",
  }
}

function LandlordPayments() {
  const [payments, setPayments] = useState([])
  const [tenancies, setTenancies] = useState([])
  const [adjustments, setAdjustments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [isCreatingAdjustment, setIsCreatingAdjustment] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [paymentForm, setPaymentForm] = useState(createPaymentForm)
  const [adjustmentForm, setAdjustmentForm] = useState(createAdjustmentForm)

  const outstandingTotal = useMemo(
    () =>
      payments.reduce(
        (sum, payment) => sum + Number(payment.outstanding_balance || 0),
        0,
      ),
    [payments],
  )

  useEffect(() => {
    let isMounted = true

    async function loadWorkspace() {
      try {
        const [paymentsPayload, adjustmentsPayload, tenanciesPayload] = await Promise.all([
          paymentsApi.list(),
          paymentsApi.listAdjustments(),
          tenanciesApi.list(),
        ])
        if (!isMounted) {
          return
        }
        setPayments(unwrapResults(paymentsPayload))
        setAdjustments(unwrapResults(adjustmentsPayload))
        setTenancies(unwrapResults(tenanciesPayload))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load landlord payment workspace.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadWorkspace()
    return () => {
      isMounted = false
    }
  }, [])

  async function refreshWorkspace() {
    const [paymentsPayload, adjustmentsPayload] = await Promise.all([
      paymentsApi.list(),
      paymentsApi.listAdjustments(),
    ])
    setPayments(unwrapResults(paymentsPayload))
    setAdjustments(unwrapResults(adjustmentsPayload))
  }

  function handlePaymentFieldChange(event) {
    const { name, value } = event.target
    setPaymentForm((current) => ({ ...current, [name]: value }))
  }

  function handleAdjustmentFieldChange(event) {
    const { name, value } = event.target
    setAdjustmentForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreatePayment(event) {
    event.preventDefault()
    if (!paymentForm.tenancy || !paymentForm.amount_due || !paymentForm.status) {
      toast.error("Tenancy, amount due, and status are required.")
      return
    }

    setIsCreatingPayment(true)
    try {
      const payload = {
        amount_due: paymentForm.amount_due,
        amount_paid: paymentForm.amount_paid || 0,
        category: paymentForm.category,
        currency: "RWF",
        due_date: paymentForm.due_date || null,
        method: paymentForm.method,
        notes: paymentForm.notes,
        reference: paymentForm.reference,
        status: paymentForm.status,
        tenancy: Number(paymentForm.tenancy),
      }
      await paymentsApi.create(payload)
      await refreshWorkspace()
      setPaymentForm(createPaymentForm())
      toast.success("Payment record created.")
    } catch (error) {
      toast.error(error.message || "Unable to create payment record.")
    } finally {
      setIsCreatingPayment(false)
    }
  }

  async function handleCreateAdjustment(event) {
    event.preventDefault()
    if (!adjustmentForm.payment || !adjustmentForm.amount_delta || !adjustmentForm.reason) {
      toast.error("Payment, amount delta, and reason are required.")
      return
    }

    setIsCreatingAdjustment(true)
    try {
      await paymentsApi.createAdjustment({
        adjustment_type: adjustmentForm.adjustment_type,
        amount_delta: adjustmentForm.amount_delta,
        payment: Number(adjustmentForm.payment),
        reason: adjustmentForm.reason,
      })
      await refreshWorkspace()
      setAdjustmentForm(createAdjustmentForm())
      toast.success("Adjustment request created.")
    } catch (error) {
      toast.error(error.message || "Unable to create adjustment request.")
    } finally {
      setIsCreatingAdjustment(false)
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
      eyebrow="Landlord · Payments"
      lede="Record payments for your tenancies and request adjustments when reconciliation is needed."
      title="Manage rent and payment records"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <CreditCardIcon className="ui-icon" />
          </div>
          <div>
            <span>Payments</span>
            <strong>{payments.length}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <WalletIcon className="ui-icon" />
          </div>
          <div>
            <span>Outstanding</span>
            <strong>{formatMoney(outstandingTotal)}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Create payment" title="Record a payment entry">
          <form className="tenant-form-grid" onSubmit={handleCreatePayment}>
            <label>
              Tenancy
              <select className="form-control" name="tenancy" onChange={handlePaymentFieldChange} value={paymentForm.tenancy}>
                <option value="">Select tenancy</option>
                {tenancies.map((tenancy) => (
                  <option key={tenancy.id} value={tenancy.id}>
                    {tenancy.property_title} · {tenancy.tenant_name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select className="form-control" name="category" onChange={handlePaymentFieldChange} value={paymentForm.category}>
                {paymentCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select className="form-control" name="status" onChange={handlePaymentFieldChange} value={paymentForm.status}>
                {paymentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Method
              <select className="form-control" name="method" onChange={handlePaymentFieldChange} value={paymentForm.method}>
                {paymentMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Amount due
              <input className="form-control" min="0" name="amount_due" onChange={handlePaymentFieldChange} step="0.01" type="number" value={paymentForm.amount_due} />
            </label>

            <label>
              Amount paid
              <input className="form-control" min="0" name="amount_paid" onChange={handlePaymentFieldChange} step="0.01" type="number" value={paymentForm.amount_paid} />
            </label>

            <label>
              Due date
              <input className="form-control" name="due_date" onChange={handlePaymentFieldChange} type="date" value={paymentForm.due_date} />
            </label>

            <label>
              Reference
              <input className="form-control" name="reference" onChange={handlePaymentFieldChange} type="text" value={paymentForm.reference} />
            </label>

            <label className="tenant-form-grid__full">
              Notes
              <textarea className="form-control" name="notes" onChange={handlePaymentFieldChange} rows="3" value={paymentForm.notes} />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isCreatingPayment} type="submit">
                <CreditCardIcon className="ui-icon" />
                {isCreatingPayment ? "Saving..." : "Create payment"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Adjustment" title="Request adjustment on a payment">
          <form className="tenant-form-grid" onSubmit={handleCreateAdjustment}>
            <label>
              Payment
              <select className="form-control" name="payment" onChange={handleAdjustmentFieldChange} value={adjustmentForm.payment}>
                <option value="">Select payment</option>
                {payments.map((payment) => (
                  <option key={payment.id} value={payment.id}>
                    {payment.property_title} · {formatMoney(payment.amount_due, payment.currency)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Type
              <select className="form-control" name="adjustment_type" onChange={handleAdjustmentFieldChange} value={adjustmentForm.adjustment_type}>
                <option value="correction">Correction</option>
                <option value="reversal">Reversal</option>
                <option value="write_off">Write off</option>
              </select>
            </label>

            <label>
              Amount delta
              <input className="form-control" name="amount_delta" onChange={handleAdjustmentFieldChange} step="0.01" type="number" value={adjustmentForm.amount_delta} />
            </label>

            <label className="tenant-form-grid__full">
              Reason
              <textarea className="form-control" name="reason" onChange={handleAdjustmentFieldChange} rows="3" value={adjustmentForm.reason} />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-outline-dark" disabled={isCreatingAdjustment} type="submit">
                {isCreatingAdjustment ? "Saving..." : "Create adjustment"}
              </button>
            </div>
          </form>
        </TenantPanel>
      </section>

      <TenantPanel eyebrow="Payment records" title="All landlord-visible payments">
        {payments.length ? (
          <div className="tenant-data-list">
            {payments.map((payment) => (
              <article className="tenant-record-row" key={payment.id}>
                <div className="tenant-record-row__icon">
                  <CreditCardIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{payment.property_title}</strong>
                  <span>
                    Due {formatDate(payment.due_date)} · {formatLabel(payment.method)} · {payment.tenant_name}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <strong>{formatMoney(payment.amount_paid, payment.currency)}</strong>
                  <span className={`tenant-status-pill tenant-status-pill--${payment.status}`}>
                    {formatLabel(payment.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No payment records yet." />
        )}
      </TenantPanel>

      <TenantPanel eyebrow="Adjustment history" title="Submitted adjustments">
        {adjustments.length ? (
          <div className="tenant-data-list">
            {adjustments.map((adjustment) => (
              <article className="tenant-record-row" key={adjustment.id}>
                <div className="tenant-record-row__icon">
                  <WalletIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{formatLabel(adjustment.adjustment_type)}</strong>
                  <span>{adjustment.reason}</span>
                </div>
                <div className="tenant-record-row__meta">
                  <strong>{formatMoney(adjustment.amount_delta)}</strong>
                  <span className={`tenant-status-pill tenant-status-pill--${adjustment.status}`}>
                    {formatLabel(adjustment.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No adjustment requests yet." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default LandlordPayments
