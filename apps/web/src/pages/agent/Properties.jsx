import { useEffect, useState } from "react"
import { HomeIcon, UsersIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatLabel,
  formatMoney,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { agentsApi, profilesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function AgentProperties() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadProperties() {
      try {
        const profile = await profilesApi.getAgentProfile()
        const payload = await agentsApi.listManagedProperties(profile.id)
        if (isMounted) {
          setProperties(unwrapResults(payload))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load managed properties.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProperties()
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
      eyebrow="Agent · Properties"
      lede="View only the properties currently assigned to your agent account."
      title="Managed properties"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <HomeIcon className="ui-icon" />
          </div>
          <div>
            <span>Managed homes</span>
            <strong>{properties.length}</strong>
          </div>
        </article>
      </section>

      <TenantPanel eyebrow="Assigned scope" title="Property list">
        {properties.length ? (
          <div className="tenant-data-list">
            {properties.map((property) => (
              <article className="tenant-detail-card" key={property.id}>
                <div className="tenant-detail-card__header">
                  <div>
                    <h4>{property.title}</h4>
                    <p>
                      {property.neighborhood || property.city} · {formatLabel(property.property_type)}
                    </p>
                  </div>
                  <span className={`tenant-status-pill tenant-status-pill--${property.status}`}>
                    {formatLabel(property.status)}
                  </span>
                </div>
                <div className="tenant-detail-grid">
                  <article>
                    <span>Rent</span>
                    <strong>{formatMoney(property.rent_amount, property.currency)}</strong>
                  </article>
                  <article>
                    <span>Public</span>
                    <strong>{property.is_public ? "Yes" : "No"}</strong>
                  </article>
                  <article>
                    <span>Reference</span>
                    <strong>{property.property_reference}</strong>
                  </article>
                  <article>
                    <span>Active tenancies</span>
                    <strong>{property.active_tenancies.length}</strong>
                  </article>
                </div>
                {property.active_tenancies.length ? (
                  <div className="tenant-data-list">
                    {property.active_tenancies.map((tenancy) => (
                      <article className="tenant-record-row" key={tenancy.id}>
                        <div className="tenant-record-row__icon">
                          <UsersIcon className="ui-icon" />
                        </div>
                        <div className="tenant-record-row__body">
                          <strong>{tenancy.tenant_name}</strong>
                          <span>
                            {tenancy.tenant_identifier} · {formatLabel(tenancy.status)}
                          </span>
                        </div>
                        <div className="tenant-record-row__meta">
                          <span>{tenancy.legal_id_type || "Legal ID hidden"}</span>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No properties are currently assigned." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default AgentProperties
