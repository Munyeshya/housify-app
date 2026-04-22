import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { AlertIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { complaintsApi, tenanciesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

const complaintCategoryOptions = [
  { label: "Maintenance", value: "maintenance" },
  { label: "Payment", value: "payment" },
  { label: "Behavior", value: "behavior" },
  { label: "Security", value: "security" },
  { label: "Cleanliness", value: "cleanliness" },
  { label: "Other", value: "other" },
]

function createComplaintForm() {
  return {
    category: "maintenance",
    description: "",
    tenancy: "",
    title: "",
  }
}

function LandlordComplaints() {
  const [complaints, setComplaints] = useState([])
  const [tenancies, setTenancies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [form, setForm] = useState(createComplaintForm)

  useEffect(() => {
    let isMounted = true

    async function loadWorkspace() {
      try {
        const [complaintsPayload, tenanciesPayload] = await Promise.all([
          complaintsApi.list(),
          tenanciesApi.list(),
        ])
        if (!isMounted) {
          return
        }
        setComplaints(unwrapResults(complaintsPayload))
        setTenancies(unwrapResults(tenanciesPayload))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load landlord complaints.")
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

  async function refreshComplaints() {
    const payload = await complaintsApi.list()
    setComplaints(unwrapResults(payload))
  }

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreateComplaint(event) {
    event.preventDefault()
    if (!form.tenancy || !form.title || !form.description) {
      toast.error("Tenancy, title, and description are required.")
      return
    }

    setIsSaving(true)
    try {
      await complaintsApi.create({
        category: form.category,
        description: form.description,
        tenancy: Number(form.tenancy),
        title: form.title,
      })
      await refreshComplaints()
      setForm(createComplaintForm())
      toast.success("Complaint created.")
    } catch (error) {
      toast.error(error.message || "Unable to create complaint.")
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
      eyebrow="Landlord · Complaints"
      lede="Track active issue records and open new complaint threads for specific tenancies."
      title="Manage complaint records"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <AlertIcon className="ui-icon" />
          </div>
          <div>
            <span>Total complaints</span>
            <strong>{complaints.length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="New complaint" title="Open issue record">
          <form className="tenant-form-grid" onSubmit={handleCreateComplaint}>
            <label>
              Tenancy
              <select className="form-control" name="tenancy" onChange={handleFieldChange} value={form.tenancy}>
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
              <select className="form-control" name="category" onChange={handleFieldChange} value={form.category}>
                {complaintCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="tenant-form-grid__full">
              Title
              <input className="form-control" name="title" onChange={handleFieldChange} type="text" value={form.title} />
            </label>

            <label className="tenant-form-grid__full">
              Description
              <textarea className="form-control" name="description" onChange={handleFieldChange} rows="4" value={form.description} />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isSaving} type="submit">
                {isSaving ? "Saving..." : "Create complaint"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Latest complaints" title="Recent activity">
          {complaints.length ? (
            <div className="tenant-data-list">
              {complaints.slice(0, 6).map((complaint) => (
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
            <TenantEmptyState message="No complaints created yet." />
          )}
        </TenantPanel>
      </section>
    </TenantWorkspacePage>
  )
}

export default LandlordComplaints
