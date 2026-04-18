import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import { TenantPanel, TenantWorkspacePage } from "../../components/tenant/TenantWorkspaceBlocks"
import { MailIcon, PhoneIcon, ShieldIcon, UserCircleIcon } from "../../components/common/Icons"
import { profilesApi } from "../../services/api"

function Profile() {
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({
    full_name: "",
    phone_number: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      try {
        const response = await profilesApi.getTenantProfile()
        if (isMounted) {
          setProfile(response)
          setForm({
            full_name: response.user?.full_name || "",
            phone_number: response.user?.phone_number || "",
          })
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load tenant profile.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSave(event) {
    event.preventDefault()

    setIsSaving(true)
    try {
      const response = await profilesApi.updateTenantProfile(form)
      setProfile(response)
      toast.success("Profile updated.")
    } catch (error) {
      toast.error(error.message || "Unable to save your profile.")
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
      eyebrow="Profile"
      lede="Update the core contact details tied to this tenant account and keep the account record clean for future tenancy and payment workflows."
      title="Tenant profile"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <UserCircleIcon className="ui-icon" />
          </div>
          <div>
            <span>Tenant name</span>
            <strong>{profile?.user?.full_name || "Not set"}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <MailIcon className="ui-icon" />
          </div>
          <div>
            <span>Email</span>
            <strong>{profile?.user?.email || "Not set"}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <ShieldIcon className="ui-icon" />
          </div>
          <div>
            <span>Legal document</span>
            <strong>{profile?.has_legal_id_document ? "On file" : "Missing"}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Edit profile" title="Update your contact details">
          <form className="tenant-form-grid" onSubmit={handleSave}>
            <label>
              Full name
              <input
                className="form-control"
                name="full_name"
                onChange={handleFieldChange}
                type="text"
                value={form.full_name}
              />
            </label>

            <label>
              Phone number
              <input
                className="form-control"
                name="phone_number"
                onChange={handleFieldChange}
                type="text"
                value={form.phone_number}
              />
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isSaving} type="submit">
                <PhoneIcon className="ui-icon" />
                {isSaving ? "Saving..." : "Save profile"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Account record" title="Read-only account details">
          <div className="tenant-detail-card">
            <div className="tenant-detail-grid">
              <article>
                <span>Email address</span>
                <strong>{profile?.user?.email || "Not available"}</strong>
              </article>
              <article>
                <span>Tenant identifier</span>
                <strong>{profile?.tenant_identifier || "Not available"}</strong>
              </article>
              <article>
                <span>Phone number</span>
                <strong>{profile?.user?.phone_number || "Not provided"}</strong>
              </article>
              <article>
                <span>Legal ID status</span>
                <strong>{profile?.has_legal_id_document ? "On file" : "Not uploaded"}</strong>
              </article>
            </div>
          </div>
        </TenantPanel>
      </section>
    </TenantWorkspacePage>
  )
}

export default Profile
