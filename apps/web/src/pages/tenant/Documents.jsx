import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  formatDate,
  formatLabel,
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { CalendarIcon, DocumentIcon, ShieldIcon } from "../../components/common/Icons"
import { documentsApi, profilesApi } from "../../services/api"

const documentTypeOptions = [
  { label: "ID", value: "National ID" },
  { label: "Passport", value: "Passport" },
]

function buildDocumentForm(document) {
  return {
    document_file: null,
    document_file_name: document?.document_name || "",
    document_number: document?.document_number || "",
    document_type: document?.document_type || "National ID",
    expires_on: document?.expires_on || "",
    issuing_country: document?.issuing_country || "Rwanda",
    notes: document?.notes || "",
  }
}

function Documents() {
  const [profile, setProfile] = useState(null)
  const [document, setDocument] = useState(null)
  const [form, setForm] = useState(buildDocumentForm(null))
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadDocumentsWorkspace() {
      try {
        const [profileResponse, documentResponse] = await Promise.all([
          profilesApi.getTenantProfile(),
          documentsApi.getTenantLegalDocument(),
        ])

        if (!isMounted) {
          return
        }

        setProfile(profileResponse)
        setDocument(documentResponse)
        setForm(buildDocumentForm(documentResponse))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load your legal document record.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDocumentsWorkspace()

    return () => {
      isMounted = false
    }
  }, [])

  function handleFieldChange(event) {
    const { files, name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]:
        name === "document_file"
          ? files?.[0] || null
          : value,
      ...(name === "document_file"
        ? { document_file_name: files?.[0]?.name || current.document_file_name }
        : {}),
    }))
  }

  async function handleSave(event) {
    event.preventDefault()

    if (!profile?.id) {
      toast.error("Tenant profile is missing, so the document cannot be saved yet.")
      return
    }

    setIsSaving(true)
    try {
      const payload = new FormData()
      payload.append("tenant", profile.id)
      payload.append("document_type", form.document_type)
      payload.append("document_number", form.document_number)
      payload.append("issuing_country", form.issuing_country)
      payload.append("status", document?.status || "submitted")
      payload.append("notes", form.notes)

      if (form.expires_on) {
        payload.append("expires_on", form.expires_on)
      }
      if (form.document_file) {
        payload.append("document_file", form.document_file)
      }

      const nextDocument = await documentsApi.upsertTenantLegalDocument(payload)

      setDocument(nextDocument)
      setForm(buildDocumentForm(nextDocument))
      toast.success("Legal document saved.")
    } catch (error) {
      toast.error(error.message || "Unable to save this legal document.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!document?.id) {
      return
    }

    setIsSaving(true)
    try {
      await documentsApi.deleteTenantLegalDocument(document.id)
      setDocument(null)
      setForm(buildDocumentForm(null))
      toast.success("Legal document removed.")
    } catch (error) {
      toast.error(error.message || "Unable to remove this legal document.")
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
      eyebrow="Documents"
      lede="Keep your legal identification record current so tenancy workflows and verification checks have the document they need on file."
      title="Legal document record"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <ShieldIcon className="ui-icon" />
          </div>
          <div>
            <span>Status</span>
            <strong>{formatLabel(document?.status || "not_uploaded")}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <DocumentIcon className="ui-icon" />
          </div>
          <div>
            <span>Document type</span>
            <strong>{document?.document_type || "Not uploaded"}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <CalendarIcon className="ui-icon" />
          </div>
          <div>
            <span>Last updated</span>
            <strong>{formatDate(document?.updated_at)}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Legal ID" title="Upload or update your record">
          <form className="tenant-form-grid" onSubmit={handleSave}>
            <label>
              Document type
              <select
                className="form-control"
                name="document_type"
                onChange={handleFieldChange}
                value={form.document_type}
              >
                {documentTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Document number
              <input
                className="form-control"
                name="document_number"
                onChange={handleFieldChange}
                placeholder="Enter document number"
                type="text"
                value={form.document_number}
              />
            </label>

            <label>
              Issuing country
              <input
                className="form-control"
                name="issuing_country"
                onChange={handleFieldChange}
                type="text"
                value={form.issuing_country}
              />
            </label>

            <label>
              Expiry date
              <input
                className="form-control"
                name="expires_on"
                onChange={handleFieldChange}
                type="date"
                value={form.expires_on}
              />
            </label>

            <label className="tenant-form-grid__full">
              Upload document file
              <input
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                className="form-control"
                name="document_file"
                onChange={handleFieldChange}
                type="file"
              />
              <small className="tenant-field-hint">
                {form.document_file_name || "Accepted: PDF, PNG, JPG, JPEG, WEBP"}
              </small>
            </label>

            <label className="tenant-form-grid__full">
              Notes
              <textarea
                className="form-control"
                name="notes"
                onChange={handleFieldChange}
                placeholder="Optional note about the uploaded document"
                rows="4"
                value={form.notes}
              />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isSaving} type="submit">
                <DocumentIcon className="ui-icon" />
                {isSaving ? "Saving..." : "Save document"}
              </button>
              {document ? (
                <button
                  className="btn btn-outline-dark"
                  disabled={isSaving}
                  onClick={handleDelete}
                  type="button"
                >
                  Remove document
                </button>
              ) : null}
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Current record" title="What is already on file">
          {document ? (
            <div className="tenant-detail-card">
              <div className="tenant-detail-card__header">
                <div>
                  <h4>{document.document_type}</h4>
                  <p>{document.document_number}</p>
                </div>
                <span className={`tenant-status-pill tenant-status-pill--${document.status}`}>
                  {formatLabel(document.status)}
                </span>
              </div>

              <div className="tenant-detail-grid">
                <article>
                  <span>Issuing country</span>
                  <strong>{document.issuing_country}</strong>
                </article>
                <article>
                  <span>Expiry date</span>
                  <strong>{formatDate(document.expires_on)}</strong>
                </article>
                <article>
                  <span>Uploaded</span>
                  <strong>{formatDate(document.uploaded_at)}</strong>
                </article>
                <article>
                  <span>Updated</span>
                  <strong>{formatDate(document.updated_at)}</strong>
                </article>
              </div>

              <div className="tenant-note-card">
                <span>Stored document</span>
                <p>
                  <a href={document.document_url} rel="noreferrer" target="_blank">
                    Open {document.document_name || "stored document"}
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <TenantEmptyState message="No legal document has been uploaded for this tenant account yet." />
          )}
        </TenantPanel>
      </section>
    </TenantWorkspacePage>
  )
}

export default Documents
