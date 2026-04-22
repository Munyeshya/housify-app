import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { CalendarIcon, HomeIcon, SearchIcon, UsersIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
  formatMoney,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { historyApi, propertiesApi, tenanciesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

const tenancyStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Terminated", value: "terminated" },
]

const billingCycleOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
]

function createTenancyForm() {
  return {
    billing_cycle_snapshot: "monthly",
    end_date: "",
    monthly_rent_snapshot: "",
    move_out_date: "",
    notes: "",
    property: "",
    security_deposit_snapshot: "",
    start_date: "",
    status: "active",
    tenant: "",
    tenant_identifier: "",
    tenant_lookup_reason: "",
  }
}

function LandlordTenancies() {
  const [tenancies, setTenancies] = useState([])
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isLookingUpTenant, setIsLookingUpTenant] = useState(false)
  const [lookupSummary, setLookupSummary] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [form, setForm] = useState(createTenancyForm)

  const openTenancies = useMemo(
    () => tenancies.filter((tenancy) => ["pending", "active"].includes(tenancy.status)),
    [tenancies],
  )

  useEffect(() => {
    let isMounted = true

    async function loadWorkspace() {
      try {
        const [tenanciesPayload, propertiesPayload] = await Promise.all([
          tenanciesApi.list(),
          propertiesApi.listManagedProperties(),
        ])
        if (!isMounted) {
          return
        }
        setTenancies(unwrapResults(tenanciesPayload))
        setProperties(unwrapResults(propertiesPayload))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load landlord tenancies.")
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

  async function refreshTenancies() {
    const payload = await tenanciesApi.list()
    setTenancies(unwrapResults(payload))
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleTenantLookup() {
    if (!form.tenant_identifier.trim()) {
      toast.error("Enter a tenant identifier first.")
      return
    }

    setIsLookingUpTenant(true)
    try {
      const response = await historyApi.lookupTenant({
        lookup_reason: form.tenant_lookup_reason,
        tenant_identifier: form.tenant_identifier.trim(),
      })
      setLookupSummary(response.summary)
      setForm((current) => ({
        ...current,
        tenant: String(response.tenantId || ""),
      }))
      toast.success("Tenant lookup completed.")
    } catch (error) {
      setLookupSummary(null)
      setForm((current) => ({
        ...current,
        tenant: "",
      }))
      toast.error(error.message || "Tenant lookup failed.")
    } finally {
      setIsLookingUpTenant(false)
    }
  }

  async function handleCreateTenancy(event) {
    event.preventDefault()

    if (!form.property || !form.tenant || !form.start_date || !form.monthly_rent_snapshot) {
      toast.error("Property, tenant, start date, and monthly rent are required.")
      return
    }

    setIsCreating(true)
    try {
      const payload = {
        billing_cycle_snapshot: form.billing_cycle_snapshot,
        monthly_rent_snapshot: form.monthly_rent_snapshot,
        notes: form.notes,
        property: Number(form.property),
        security_deposit_snapshot: form.security_deposit_snapshot || 0,
        start_date: form.start_date,
        status: form.status,
        tenant: Number(form.tenant),
      }

      if (form.end_date) {
        payload.end_date = form.end_date
      }
      if (form.move_out_date) {
        payload.move_out_date = form.move_out_date
      }

      await tenanciesApi.create(payload)
      await refreshTenancies()
      setForm(createTenancyForm())
      setLookupSummary(null)
      toast.success("Tenancy created.")
    } catch (error) {
      toast.error(error.message || "Unable to create tenancy.")
    } finally {
      setIsCreating(false)
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
      eyebrow="Landlord · Tenancies"
      lede="Assign tenants to properties using tenant identifiers and keep a clear timeline of occupancy."
      title="Manage tenancy assignments"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <HomeIcon className="ui-icon" />
          </div>
          <div>
            <span>Total tenancies</span>
            <strong>{tenancies.length}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <UsersIcon className="ui-icon" />
          </div>
          <div>
            <span>Open tenancies</span>
            <strong>{openTenancies.length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="New tenancy" title="Assign tenant to property">
          <form className="tenant-form-grid" onSubmit={handleCreateTenancy}>
            <label>
              Property
              <select className="form-control" name="property" onChange={handleFieldChange} value={form.property}>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title} ({property.property_reference})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Tenant identifier
              <input
                className="form-control"
                name="tenant_identifier"
                onChange={handleFieldChange}
                placeholder="e.g. TN5A2C9D"
                type="text"
                value={form.tenant_identifier}
              />
            </label>

            <label>
              Lookup reason
              <input
                className="form-control"
                name="tenant_lookup_reason"
                onChange={handleFieldChange}
                placeholder="Tenant screening for assignment"
                type="text"
                value={form.tenant_lookup_reason}
              />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-outline-dark" disabled={isLookingUpTenant} onClick={handleTenantLookup} type="button">
                <SearchIcon className="ui-icon" />
                {isLookingUpTenant ? "Checking..." : "Lookup tenant"}
              </button>
            </div>

            <label>
              Status
              <select className="form-control" name="status" onChange={handleFieldChange} value={form.status}>
                {tenancyStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Start date
              <input className="form-control" name="start_date" onChange={handleFieldChange} type="date" value={form.start_date} />
            </label>

            <label>
              End date
              <input className="form-control" name="end_date" onChange={handleFieldChange} type="date" value={form.end_date} />
            </label>

            <label>
              Move-out date
              <input className="form-control" name="move_out_date" onChange={handleFieldChange} type="date" value={form.move_out_date} />
            </label>

            <label>
              Monthly rent
              <input
                className="form-control"
                min="0"
                name="monthly_rent_snapshot"
                onChange={handleFieldChange}
                step="0.01"
                type="number"
                value={form.monthly_rent_snapshot}
              />
            </label>

            <label>
              Security deposit
              <input
                className="form-control"
                min="0"
                name="security_deposit_snapshot"
                onChange={handleFieldChange}
                step="0.01"
                type="number"
                value={form.security_deposit_snapshot}
              />
            </label>

            <label>
              Billing cycle
              <select className="form-control" name="billing_cycle_snapshot" onChange={handleFieldChange} value={form.billing_cycle_snapshot}>
                {billingCycleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="tenant-form-grid__full">
              Notes
              <textarea
                className="form-control"
                name="notes"
                onChange={handleFieldChange}
                placeholder="Optional tenancy notes"
                rows="3"
                value={form.notes}
              />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isCreating || !form.tenant} type="submit">
                <CalendarIcon className="ui-icon" />
                {isCreating ? "Creating..." : "Create tenancy"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Lookup result" title="Resolved tenant details">
          {lookupSummary ? (
            <div className="tenant-detail-card">
              <div className="tenant-detail-card__header">
                <div>
                  <h4>{lookupSummary.tenant_name}</h4>
                  <p>{lookupSummary.tenant_identifier}</p>
                </div>
                <span className={lookupSummary.has_legal_id_document ? "tenant-status-pill tenant-status-pill--verified" : "tenant-status-pill tenant-status-pill--rejected"}>
                  {lookupSummary.has_legal_id_document ? "Legal ID available" : "Missing legal ID"}
                </span>
              </div>
              <div className="tenant-detail-grid">
                <article>
                  <span>Total tenancies</span>
                  <strong>{lookupSummary.total_tenancies}</strong>
                </article>
                <article>
                  <span>Active</span>
                  <strong>{lookupSummary.active_tenancies}</strong>
                </article>
                <article>
                  <span>Completed</span>
                  <strong>{lookupSummary.completed_tenancies}</strong>
                </article>
                <article>
                  <span>Terminated</span>
                  <strong>{lookupSummary.terminated_tenancies}</strong>
                </article>
              </div>
            </div>
          ) : (
            <TenantEmptyState message="Run tenant lookup to resolve the tenant id before assignment." />
          )}
        </TenantPanel>
      </section>

      <TenantPanel eyebrow="Current and past" title="Tenancy records">
        {tenancies.length ? (
          <div className="tenant-data-list">
            {tenancies.map((tenancy) => (
              <article className="tenant-record-row" key={tenancy.id}>
                <div className="tenant-record-row__icon">
                  <HomeIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{tenancy.property_title}</strong>
                  <span>
                    {tenancy.tenant_name} · {tenancy.tenant_identifier} · {formatDate(tenancy.start_date)} to{" "}
                    {formatDate(tenancy.occupancy_end_date || tenancy.end_date)}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <strong>{formatMoney(tenancy.monthly_rent_snapshot)}</strong>
                  <span className={`tenant-status-pill tenant-status-pill--${tenancy.status}`}>
                    {formatLabel(tenancy.status)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No tenancy records yet." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default LandlordTenancies
