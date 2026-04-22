import { useEffect, useState } from "react"
import { CreditCardIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
  formatMoney,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { agentsApi, profilesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function AgentPayments() {
  const [payments, setPayments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadPayments() {
      try {
        const profile = await profilesApi.getAgentProfile()
        const payload = await agentsApi.listManagedPayments(profile.id)
        if (isMounted) {
          setPayments(unwrapResults(payload))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load managed payments.")
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

  if (isLoading) {
    return <DashboardLoading />
  }

  if (errorMessage) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <TenantWorkspacePage
      eyebrow="Agent · Payments"
      lede="Follow payment progress for properties assigned to your account."
      title="Managed payment records"
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
      </section>

      <TenantPanel eyebrow="Records" title="Payment list">
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
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No managed payment records found." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default AgentPayments
