import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { DocumentIcon, ShieldIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { documentsApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function createAccessForm() {
  return {
    is_enabled: true,
    landlord: "",
    notes: "",
    provider_code: "national-registry",
  }
}

function AdminVerification() {
  const [accessRows, setAccessRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [form, setForm] = useState(createAccessForm)

  useEffect(() => {
    let isMounted = true

    async function loadVerificationAccess() {
      try {
        const payload = await documentsApi.listVerificationAccess()
        if (isMounted) {
          setAccessRows(unwrapResults(payload))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load landlord verification access.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadVerificationAccess()
    return () => {
      isMounted = false
    }
  }, [])

  async function refreshAccessRows() {
    const payload = await documentsApi.listVerificationAccess()
    setAccessRows(unwrapResults(payload))
  }

  function handleFieldChange(event) {
    const { checked, name, type, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  async function handleSaveAccess(event) {
    event.preventDefault()
    if (!form.landlord) {
      toast.error("Choose a landlord.")
      return
    }

    setIsSaving(true)
    try {
      await documentsApi.updateVerificationAccess({
        is_enabled: Boolean(form.is_enabled),
        landlord: Number(form.landlord),
        notes: form.notes,
        provider_code: form.provider_code,
      })
      await refreshAccessRows()
      setForm(createAccessForm())
      toast.success("Verification access updated.")
    } catch (error) {
      toast.error(error.message || "Unable to update verification access.")
    } finally {
      setIsSaving(false)
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
      eyebrow="Admin · Verification"
      lede="Control which landlords can access external tenant document verification providers."
      title="Landlord verification access"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <ShieldIcon className="ui-icon" />
          </div>
          <div>
            <span>Landlords tracked</span>
            <strong>{accessRows.length}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <DocumentIcon className="ui-icon" />
          </div>
          <div>
            <span>Enabled access</span>
            <strong>{accessRows.filter((row) => row.is_enabled).length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Grant or revoke" title="Update landlord access">
          <form className="tenant-form-grid" onSubmit={handleSaveAccess}>
            <label>
              Landlord
              <select className="form-control" name="landlord" onChange={handleFieldChange} value={form.landlord}>
                <option value="">Select landlord</option>
                {accessRows.map((row) => (
                  <option key={row.landlord} value={row.landlord}>
                    {row.landlord_name} (#{row.landlord})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Provider code
              <input className="form-control" name="provider_code" onChange={handleFieldChange} type="text" value={form.provider_code} />
            </label>

            <label className="tenant-form-grid__full workspace-checkbox">
              <input checked={form.is_enabled} name="is_enabled" onChange={handleFieldChange} type="checkbox" />
              <span>Enable verification access</span>
            </label>

            <label className="tenant-form-grid__full">
              Notes
              <textarea className="form-control" name="notes" onChange={handleFieldChange} rows="3" value={form.notes} />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Save access"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Current state" title="Existing access entries">
          {accessRows.length ? (
            <div className="tenant-data-list">
              {accessRows.map((row) => (
                <article className="tenant-record-row" key={row.id}>
                  <div className="tenant-record-row__icon">
                    <ShieldIcon className="ui-icon" />
                  </div>
                  <div className="tenant-record-row__body">
                    <strong>{row.landlord_name}</strong>
                    <span>
                      Provider: {row.provider_code || "n/a"} · Updated {formatDate(row.updated_at)}
                    </span>
                  </div>
                  <div className="tenant-record-row__meta">
                    <span className={row.is_enabled ? "tenant-status-pill tenant-status-pill--verified" : "tenant-status-pill tenant-status-pill--rejected"}>
                      {row.is_enabled ? "Enabled" : "Disabled"}
                    </span>
                    <span>{formatLabel(row.notes || "No notes")}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <TenantEmptyState message="No verification access rows found." />
          )}
        </TenantPanel>
      </section>
    </TenantWorkspacePage>
  )
}

export default AdminVerification
