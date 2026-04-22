import { useEffect, useState } from "react"
import { AlertIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { agentsApi, profilesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function AgentComplaints() {
  const [complaints, setComplaints] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadComplaints() {
      try {
        const profile = await profilesApi.getAgentProfile()
        const payload = await agentsApi.listManagedComplaints(profile.id)
        if (isMounted) {
          setComplaints(unwrapResults(payload))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load managed complaints.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadComplaints()
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
      eyebrow="Agent · Complaints"
      lede="Track complaint lifecycle for all properties within your assignment scope."
      title="Managed complaints"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <AlertIcon className="ui-icon" />
          </div>
          <div>
            <span>Complaints</span>
            <strong>{complaints.length}</strong>
          </div>
        </article>
      </section>

      <TenantPanel eyebrow="Records" title="Complaint list">
        {complaints.length ? (
          <div className="tenant-data-list">
            {complaints.map((complaint) => (
              <article className="tenant-record-row" key={complaint.id}>
                <div className="tenant-record-row__icon">
                  <AlertIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{complaint.title}</strong>
                  <span>
                    {complaint.property_title} · {formatLabel(complaint.category)}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <strong>{formatDate(complaint.opened_at)}</strong>
                  <span className={`tenant-status-pill tenant-status-pill--${complaint.status}`}>
                    {formatLabel(complaint.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No complaints available for managed properties." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default AgentComplaints
