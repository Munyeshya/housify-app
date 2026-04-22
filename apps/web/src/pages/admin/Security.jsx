import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"
import { AlertIcon, ShieldIcon, UsersIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { securityApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function createFlagForm() {
  return {
    reason: "",
    severity: "high",
    target_id: "",
    target_type: "user",
  }
}

function AdminSecurity() {
  const [users, setUsers] = useState([])
  const [events, setEvents] = useState([])
  const [flags, setFlags] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingFlag, setIsSavingFlag] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [flagForm, setFlagForm] = useState(createFlagForm)
  const [busyUserActionId, setBusyUserActionId] = useState(null)
  const [busyFlagDecisionId, setBusyFlagDecisionId] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadSecurityWorkspace() {
      try {
        const [usersPayload, eventsPayload, flagsPayload] = await Promise.all([
          securityApi.listUsers(),
          securityApi.listEvents(),
          securityApi.listFlags(),
        ])
        if (!isMounted) {
          return
        }
        setUsers(unwrapResults(usersPayload))
        setEvents(unwrapResults(eventsPayload))
        setFlags(unwrapResults(flagsPayload))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load admin security workspace.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSecurityWorkspace()
    return () => {
      isMounted = false
    }
  }, [])

  async function refreshSecurityWorkspace() {
    const [usersPayload, eventsPayload, flagsPayload] = await Promise.all([
      securityApi.listUsers(),
      securityApi.listEvents(),
      securityApi.listFlags(),
    ])
    setUsers(unwrapResults(usersPayload))
    setEvents(unwrapResults(eventsPayload))
    setFlags(unwrapResults(flagsPayload))
  }

  function handleFlagFieldChange(event) {
    const { name, value } = event.target
    setFlagForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreateFlag(event) {
    event.preventDefault()
    if (!flagForm.target_id || !flagForm.reason) {
      toast.error("Target id and reason are required.")
      return
    }

    setIsSavingFlag(true)
    try {
      await securityApi.createFlag({
        reason: flagForm.reason,
        severity: flagForm.severity,
        target_id: Number(flagForm.target_id),
        target_type: flagForm.target_type,
      })
      await refreshSecurityWorkspace()
      setFlagForm(createFlagForm())
      toast.success("Security flag created.")
    } catch (error) {
      toast.error(error.message || "Unable to create security flag.")
    } finally {
      setIsSavingFlag(false)
    }
  }

  async function handleFlagDecision(flagId, status) {
    setBusyFlagDecisionId(flagId)
    try {
      await securityApi.decideFlag(flagId, { resolution_notes: "", status })
      await refreshSecurityWorkspace()
      toast.success("Flag decision saved.")
    } catch (error) {
      toast.error(error.message || "Unable to update flag.")
    } finally {
      setBusyFlagDecisionId(null)
    }
  }

  async function handleUserActivation(userId, isActive) {
    setBusyUserActionId(userId)
    try {
      if (isActive) {
        await securityApi.suspendUser(userId, { reason: "Manual admin suspension." })
        toast.success("User suspended.")
      } else {
        await securityApi.reactivateUser(userId, { reason: "Manual admin reactivation." })
        toast.success("User reactivated.")
      }
      await refreshSecurityWorkspace()
    } catch (error) {
      toast.error(error.message || "Unable to update user state.")
    } finally {
      setBusyUserActionId(null)
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
      eyebrow="Admin · Security"
      lede="Review security events, flag suspicious targets, and manage account activation."
      title="Security operations"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <UsersIcon className="ui-icon" />
          </div>
          <div>
            <span>Users</span>
            <strong>{users.length}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <AlertIcon className="ui-icon" />
          </div>
          <div>
            <span>Flags</span>
            <strong>{flags.length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Flag target" title="Create security flag">
          <form className="tenant-form-grid" onSubmit={handleCreateFlag}>
            <label>
              Target type
              <select className="form-control" name="target_type" onChange={handleFlagFieldChange} value={flagForm.target_type}>
                <option value="user">User</option>
                <option value="payment">Payment</option>
                <option value="tenancy">Tenancy</option>
                <option value="tenant_legal_document">Tenant legal document</option>
              </select>
            </label>
            <label>
              Target id
              <input className="form-control" name="target_id" onChange={handleFlagFieldChange} type="number" value={flagForm.target_id} />
            </label>
            <label>
              Severity
              <select className="form-control" name="severity" onChange={handleFlagFieldChange} value={flagForm.severity}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </label>
            <label className="tenant-form-grid__full">
              Reason
              <textarea className="form-control" name="reason" onChange={handleFlagFieldChange} rows="3" value={flagForm.reason} />
            </label>
            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isSavingFlag} type="submit">
                {isSavingFlag ? "Saving..." : "Create flag"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Flag queue" title="Decide open flags">
          {flags.length ? (
            <div className="tenant-data-list">
              {flags.map((flag) => (
                <article className="tenant-record-row" key={flag.id}>
                  <div className="tenant-record-row__icon">
                    <ShieldIcon className="ui-icon" />
                  </div>
                  <div className="tenant-record-row__body">
                    <strong>
                      {formatLabel(flag.severity)} · {flag.target_type} #{flag.target_id}
                    </strong>
                    <span>{flag.reason}</span>
                  </div>
                  <div className="tenant-record-row__meta">
                    <span className={`tenant-status-pill tenant-status-pill--${flag.status}`}>
                      {formatLabel(flag.status)}
                    </span>
                    <div className="workspace-inline-actions">
                      <button className="btn btn-outline-dark" disabled={busyFlagDecisionId === flag.id} onClick={() => handleFlagDecision(flag.id, "resolved")} type="button">
                        Resolve
                      </button>
                      <button className="btn btn-outline-dark" disabled={busyFlagDecisionId === flag.id} onClick={() => handleFlagDecision(flag.id, "dismissed")} type="button">
                        Dismiss
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <TenantEmptyState message="No security flags recorded." />
          )}
        </TenantPanel>
      </section>

      <TenantPanel eyebrow="User controls" title="Suspend or reactivate accounts">
        {users.length ? (
          <div className="tenant-data-list">
            {users.map((user) => (
              <article className="tenant-record-row" key={user.id}>
                <div className="tenant-record-row__icon">
                  <UsersIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{user.full_name || user.email}</strong>
                  <span>
                    {user.email} · {formatLabel(user.role)} · Joined {formatDate(user.date_joined)}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <span className={user.is_active ? "tenant-status-pill tenant-status-pill--verified" : "tenant-status-pill tenant-status-pill--rejected"}>
                    {user.is_active ? "Active" : "Suspended"}
                  </span>
                  <button
                    className="btn btn-outline-dark"
                    disabled={busyUserActionId === user.id}
                    onClick={() => handleUserActivation(user.id, user.is_active)}
                    type="button"
                  >
                    {user.is_active ? "Suspend" : "Reactivate"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No users available." />
        )}
      </TenantPanel>

      <TenantPanel eyebrow="Recent events" title="Audit trail">
        {events.length ? (
          <div className="tenant-data-list">
            {events.slice(0, 20).map((event) => (
              <article className="tenant-record-row" key={event.id}>
                <div className="tenant-record-row__icon">
                  <AlertIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>{formatLabel(event.event_type)}</strong>
                  <span>
                    {event.actor_name || "System"} · {event.target_type || "n/a"} #{event.target_id || "-"}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <strong>{formatDate(event.created_at)}</strong>
                  <span className={event.success ? "tenant-status-pill tenant-status-pill--verified" : "tenant-status-pill tenant-status-pill--rejected"}>
                    {event.success ? "Success" : "Failure"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No security events found." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default AdminSecurity
