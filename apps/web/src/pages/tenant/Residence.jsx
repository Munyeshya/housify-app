import { useEffect, useMemo, useState } from "react"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  formatDate,
  formatLabel,
  formatMoney,
  TenantDataList,
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { BuildingIcon, CalendarIcon, CreditCardIcon, HomeIcon, UsersIcon } from "../../components/common/Icons"
import { tenanciesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function buildResidenceHighlights(activeTenancy) {
  if (!activeTenancy) {
    return [
      { icon: HomeIcon, label: "Current home", value: "No active tenancy" },
      { icon: UsersIcon, label: "Landlord", value: "Waiting for assignment" },
      { icon: CreditCardIcon, label: "Monthly rent", value: "Not available" },
      { icon: CalendarIcon, label: "Billing cycle", value: "Not available" },
    ]
  }

  return [
    { icon: HomeIcon, label: "Current home", value: activeTenancy.property_title },
    { icon: UsersIcon, label: "Landlord", value: activeTenancy.landlord_name },
    {
      icon: CreditCardIcon,
      label: "Monthly rent",
      value: formatMoney(activeTenancy.monthly_rent_snapshot),
    },
    {
      icon: CalendarIcon,
      label: "Billing cycle",
      value: formatLabel(activeTenancy.billing_cycle_snapshot || "monthly"),
    },
  ]
}

function sortTenanciesByNewest(tenancies) {
  return [...tenancies].sort((left, right) => {
    const leftDate = left.created_at ? new Date(left.created_at).getTime() : 0
    const rightDate = right.created_at ? new Date(right.created_at).getTime() : 0
    return rightDate - leftDate
  })
}

function Residence() {
  const [tenancies, setTenancies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadResidence() {
      try {
        const response = await tenanciesApi.list()
        if (isMounted) {
          setTenancies(unwrapResults(response))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load your tenancy details.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadResidence()

    return () => {
      isMounted = false
    }
  }, [])

  const sortedTenancies = useMemo(() => sortTenanciesByNewest(tenancies), [tenancies])

  const activeTenancy =
    sortedTenancies.find((tenancy) => ["active", "pending"].includes(tenancy.status)) || null
  const residenceHistory = sortedTenancies.filter((tenancy) => tenancy.status !== "pending")

  const highlights = buildResidenceHighlights(activeTenancy)

  if (isLoading) {
    return <DashboardLoading />
  }

  if (errorMessage) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <TenantWorkspacePage
      eyebrow="Residence"
      lede="Keep a clear view of the home you currently occupy, the rent terms attached to it, and the tenancy history already on your record."
      title="Residence and tenancy details"
    >
      <section className="tenant-overview-grid">
        {highlights.map((item) => {
          const Icon = item.icon

          return (
            <article className="tenant-overview-card" key={item.label}>
              <div className="tenant-overview-card__icon">
                <Icon className="ui-icon" />
              </div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          )
        })}
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Current residence" title="Active tenancy snapshot">
          {activeTenancy ? (
            <div className="tenant-detail-card">
              <div className="tenant-detail-card__header">
                <div>
                  <h4>{activeTenancy.property_title}</h4>
                  <p>{activeTenancy.landlord_name}</p>
                </div>
                <span className={`tenant-status-pill tenant-status-pill--${activeTenancy.status}`}>
                  {formatLabel(activeTenancy.status)}
                </span>
              </div>

              <div className="tenant-detail-grid">
                <article>
                  <span>Started</span>
                  <strong>{formatDate(activeTenancy.start_date)}</strong>
                </article>
                <article>
                  <span>Ends</span>
                  <strong>{formatDate(activeTenancy.end_date)}</strong>
                </article>
                <article>
                  <span>Monthly rent</span>
                  <strong>{formatMoney(activeTenancy.monthly_rent_snapshot)}</strong>
                </article>
                <article>
                  <span>Deposit</span>
                  <strong>{formatMoney(activeTenancy.security_deposit_snapshot)}</strong>
                </article>
                <article>
                  <span>Billing cycle</span>
                  <strong>{formatLabel(activeTenancy.billing_cycle_snapshot || "monthly")}</strong>
                </article>
                <article>
                  <span>Move-out date</span>
                  <strong>{formatDate(activeTenancy.move_out_date)}</strong>
                </article>
              </div>

              <div className="tenant-note-card">
                <span>Notes</span>
                <p>{activeTenancy.notes || "No extra tenancy note has been added yet."}</p>
              </div>
            </div>
          ) : (
            <TenantEmptyState message="No active tenancy is linked to this tenant account yet." />
          )}
        </TenantPanel>

        <TenantPanel eyebrow="History" title="Occupied property history">
          {residenceHistory.length ? (
            <TenantDataList
              items={residenceHistory}
              renderItem={(tenancy) => (
                <article className="tenant-history-card" key={tenancy.id}>
                  <div className="tenant-history-card__header">
                    <div className="tenant-record-row__icon">
                      <BuildingIcon className="ui-icon" />
                    </div>
                    <div className="tenant-history-card__title">
                      <strong>{tenancy.property_title}</strong>
                      <span>{tenancy.property_location || "Location not available"}</span>
                    </div>
                    <span className={`tenant-status-pill tenant-status-pill--${tenancy.status}`}>
                      {formatLabel(tenancy.status)}
                    </span>
                  </div>

                  <div className="tenant-history-card__meta">
                    <article>
                      <span>Stayed</span>
                      <strong>{tenancy.occupancy_duration_label}</strong>
                      <small>
                        {formatDate(tenancy.start_date)} to {formatDate(tenancy.occupancy_end_date)}
                      </small>
                    </article>
                    <article>
                      <span>Total spent</span>
                      <strong>{formatMoney(tenancy.amount_paid_total)}</strong>
                      <small>{tenancy.payments_recorded} payment records</small>
                    </article>
                    <article>
                      <span>Rent snapshot</span>
                      <strong>{formatMoney(tenancy.monthly_rent_snapshot)}</strong>
                      <small>{formatLabel(tenancy.billing_cycle_snapshot || "monthly")}</small>
                    </article>
                    <article>
                      <span>Home type</span>
                      <strong>{formatLabel(tenancy.property_type || "home")}</strong>
                      <small>{tenancy.landlord_name}</small>
                    </article>
                  </div>

                  <div className="tenant-note-card">
                    <span>Tenancy notes</span>
                    <p>{tenancy.notes || "No extra tenancy note has been added for this stay."}</p>
                  </div>
                </article>
              )}
            />
          ) : (
            <TenantEmptyState message="This account has no occupied property history yet." />
          )}
        </TenantPanel>
      </section>
    </TenantWorkspacePage>
  )
}

export default Residence
