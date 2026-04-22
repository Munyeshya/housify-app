import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { ShieldIcon, UsersIcon } from "../../components/common/Icons"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
  formatDate,
  formatLabel,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { agentsApi, propertiesApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function createPrivateAgentForm() {
  return {
    bio: "",
    email: "",
    full_name: "",
    password: "",
    phone_number: "",
  }
}

function createAssignmentForm() {
  return {
    agent: "",
    property: "",
    status: "active",
  }
}

function LandlordAgents() {
  const [availableAgents, setAvailableAgents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPrivateAgent, setIsCreatingPrivateAgent] = useState(false)
  const [isCreatingAssignment, setIsCreatingAssignment] = useState(false)
  const [busyAssignmentId, setBusyAssignmentId] = useState(null)
  const [busyPrivateDeleteProfileId, setBusyPrivateDeleteProfileId] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [privateAgentForm, setPrivateAgentForm] = useState(createPrivateAgentForm)
  const [assignmentForm, setAssignmentForm] = useState(createAssignmentForm)

  const activeAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === "active"),
    [assignments],
  )

  useEffect(() => {
    let isMounted = true

    async function loadWorkspace() {
      try {
        const [availablePayload, assignmentsPayload, propertiesPayload] = await Promise.all([
          agentsApi.listAvailable(),
          agentsApi.listAssignments(),
          propertiesApi.listManagedProperties(),
        ])
        if (!isMounted) {
          return
        }
        setAvailableAgents(unwrapResults(availablePayload))
        setAssignments(unwrapResults(assignmentsPayload))
        setProperties(unwrapResults(propertiesPayload))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load landlord agent workspace.")
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

  async function refreshWorkspace() {
    const [availablePayload, assignmentsPayload] = await Promise.all([
      agentsApi.listAvailable(),
      agentsApi.listAssignments(),
    ])
    setAvailableAgents(unwrapResults(availablePayload))
    setAssignments(unwrapResults(assignmentsPayload))
  }

  function handlePrivateAgentFieldChange(event) {
    const { name, value } = event.target
    setPrivateAgentForm((current) => ({ ...current, [name]: value }))
  }

  function handleAssignmentFieldChange(event) {
    const { name, value } = event.target
    setAssignmentForm((current) => ({ ...current, [name]: value }))
  }

  async function handleCreatePrivateAgent(event) {
    event.preventDefault()
    if (!privateAgentForm.full_name || !privateAgentForm.email || !privateAgentForm.password) {
      toast.error("Full name, email, and password are required.")
      return
    }

    setIsCreatingPrivateAgent(true)
    try {
      await agentsApi.createPrivate(privateAgentForm)
      await refreshWorkspace()
      setPrivateAgentForm(createPrivateAgentForm())
      toast.success("Private agent created.")
    } catch (error) {
      toast.error(error.message || "Unable to create private agent.")
    } finally {
      setIsCreatingPrivateAgent(false)
    }
  }

  async function handleCreateAssignment(event) {
    event.preventDefault()
    if (!assignmentForm.agent || !assignmentForm.property) {
      toast.error("Select an agent and property.")
      return
    }

    setIsCreatingAssignment(true)
    try {
      await agentsApi.createAssignment({
        agent: Number(assignmentForm.agent),
        property: Number(assignmentForm.property),
        status: assignmentForm.status,
      })
      await refreshWorkspace()
      setAssignmentForm(createAssignmentForm())
      toast.success("Agent assignment created.")
    } catch (error) {
      toast.error(error.message || "Unable to create assignment.")
    } finally {
      setIsCreatingAssignment(false)
    }
  }

  async function handleRevokeAssignment(assignmentId) {
    setBusyAssignmentId(assignmentId)
    try {
      await agentsApi.revokeAssignment(assignmentId)
      await refreshWorkspace()
      toast.success("Assignment revoked.")
    } catch (error) {
      toast.error(error.message || "Unable to revoke assignment.")
    } finally {
      setBusyAssignmentId(null)
    }
  }

  async function handleDeletePrivateAgent(profileId) {
    setBusyPrivateDeleteProfileId(profileId)
    try {
      await agentsApi.deletePrivate(profileId)
      await refreshWorkspace()
      toast.success("Private agent deleted.")
    } catch (error) {
      toast.error(error.message || "Unable to delete private agent.")
    } finally {
      setBusyPrivateDeleteProfileId(null)
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
      eyebrow="Landlord · Agents"
      lede="Attach public or private agents to specific properties and revoke access any time."
      title="Manage property agent access"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <UsersIcon className="ui-icon" />
          </div>
          <div>
            <span>Available agents</span>
            <strong>{availableAgents.length}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <ShieldIcon className="ui-icon" />
          </div>
          <div>
            <span>Active assignments</span>
            <strong>{activeAssignments.length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-grid tenant-grid--primary">
        <TenantPanel eyebrow="Private agent" title="Create landlord-owned agent">
          <form className="tenant-form-grid" onSubmit={handleCreatePrivateAgent}>
            <label>
              Full name
              <input className="form-control" name="full_name" onChange={handlePrivateAgentFieldChange} type="text" value={privateAgentForm.full_name} />
            </label>
            <label>
              Email
              <input className="form-control" name="email" onChange={handlePrivateAgentFieldChange} type="email" value={privateAgentForm.email} />
            </label>
            <label>
              Phone
              <input className="form-control" name="phone_number" onChange={handlePrivateAgentFieldChange} type="text" value={privateAgentForm.phone_number} />
            </label>
            <label>
              Password
              <input className="form-control" name="password" onChange={handlePrivateAgentFieldChange} type="password" value={privateAgentForm.password} />
            </label>
            <label className="tenant-form-grid__full">
              Bio
              <textarea className="form-control" name="bio" onChange={handlePrivateAgentFieldChange} rows="3" value={privateAgentForm.bio} />
            </label>
            <div className="tenant-form-grid__footer">
              <button className="btn btn-dark" disabled={isCreatingPrivateAgent} type="submit">
                {isCreatingPrivateAgent ? "Creating..." : "Create private agent"}
              </button>
            </div>
          </form>
        </TenantPanel>

        <TenantPanel eyebrow="Assign" title="Attach agent to property">
          <form className="tenant-form-grid" onSubmit={handleCreateAssignment}>
            <label>
              Agent
              <select className="form-control" name="agent" onChange={handleAssignmentFieldChange} value={assignmentForm.agent}>
                <option value="">Select agent</option>
                {availableAgents.map((agent) => (
                  <option key={`${agent.profile_id}-${agent.id}`} value={agent.profile_id}>
                    {agent.full_name} · {formatLabel(agent.type)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Property
              <select className="form-control" name="property" onChange={handleAssignmentFieldChange} value={assignmentForm.property}>
                <option value="">Select property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="tenant-form-grid__footer">
              <button className="btn btn-outline-dark" disabled={isCreatingAssignment} type="submit">
                {isCreatingAssignment ? "Assigning..." : "Create assignment"}
              </button>
            </div>
          </form>
        </TenantPanel>
      </section>

      <TenantPanel eyebrow="Assignments" title="Current and revoked assignments">
        {assignments.length ? (
          <div className="tenant-data-list">
            {assignments.map((assignment) => (
              <article className="tenant-record-row" key={assignment.id}>
                <div className="tenant-record-row__icon">
                  <UsersIcon className="ui-icon" />
                </div>
                <div className="tenant-record-row__body">
                  <strong>
                    {assignment.agent.full_name} · {assignment.property_title}
                  </strong>
                  <span>
                    Granted {formatDate(assignment.granted_at)} · Legal ID access:{" "}
                    {assignment.can_view_legal_id ? "yes" : "no"}
                  </span>
                </div>
                <div className="tenant-record-row__meta">
                  <span className={`tenant-status-pill tenant-status-pill--${assignment.status}`}>
                    {formatLabel(assignment.status)}
                  </span>
                  {assignment.status === "active" ? (
                    <button className="btn btn-outline-dark" disabled={busyAssignmentId === assignment.id} onClick={() => handleRevokeAssignment(assignment.id)} type="button">
                      Revoke
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <TenantEmptyState message="No agent assignments yet." />
        )}
      </TenantPanel>

      <TenantPanel eyebrow="Private agents" title="Delete landlord-owned private agents">
        {availableAgents.filter((agent) => agent.type === "private").length ? (
          <div className="tenant-data-list">
            {availableAgents
              .filter((agent) => agent.type === "private")
              .map((agent) => (
                <article className="tenant-record-row" key={`private-${agent.profile_id}`}>
                  <div className="tenant-record-row__icon">
                    <ShieldIcon className="ui-icon" />
                  </div>
                  <div className="tenant-record-row__body">
                    <strong>{agent.full_name}</strong>
                    <span>{agent.email}</span>
                  </div>
                  <div className="tenant-record-row__meta">
                    <button
                      className="btn btn-outline-dark"
                      disabled={busyPrivateDeleteProfileId === agent.profile_id}
                      onClick={() => handleDeletePrivateAgent(agent.profile_id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <TenantEmptyState message="No private agents available to delete." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default LandlordAgents
