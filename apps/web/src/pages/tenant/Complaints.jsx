import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  formatDate,
  formatLabel,
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
} from "../../components/tenant/TenantWorkspaceBlocks"
import {
  AlertIcon,
  CalendarIcon,
  ChevronRightIcon,
  HomeIcon,
  UsersIcon,
} from "../../components/common/Icons"
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

function buildComplaintMessages(complaint) {
  if (!complaint) {
    return []
  }

  const messages = [
    {
      body: complaint.description,
      id: `${complaint.id}-tenant`,
      label: "You",
      meta: `${formatDate(complaint.opened_at, {
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        year: "numeric",
      })} · ${formatLabel(complaint.category)}`,
      side: "self",
      title: complaint.title,
    },
  ]

  const hasReply = Boolean(
    complaint.resolution_notes || complaint.assigned_to_name || complaint.status !== "open",
  )

  if (hasReply) {
    const replySegments = []

    if (complaint.resolution_notes) {
      replySegments.push(complaint.resolution_notes)
    } else {
      replySegments.push(`Status changed to ${formatLabel(complaint.status)}.`)
    }

    if (complaint.assigned_to_name) {
      replySegments.push(`Assigned to ${complaint.assigned_to_name}.`)
    }

    messages.push({
      body: replySegments.join(" "),
      id: `${complaint.id}-system`,
      label: complaint.landlord_name || "Property team",
      meta: `${formatDate(complaint.updated_at, {
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        year: "numeric",
      })} · ${formatLabel(complaint.status)}`,
      side: "system",
      title: complaint.resolution_notes ? "Response" : "Status update",
    })
  }

  return messages
}

function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [tenancies, setTenancies] = useState([])
  const [selectedComplaintId, setSelectedComplaintId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [form, setForm] = useState({
    category: "maintenance",
    description: "",
    tenancy: "",
    title: "",
  })

  useEffect(() => {
    let isMounted = true

    async function loadComplaintsWorkspace() {
      try {
        const [complaintsResponse, tenanciesResponse] = await Promise.all([
          complaintsApi.list(),
          tenanciesApi.list(),
        ])

        if (!isMounted) {
          return
        }

        const nextComplaints = unwrapResults(complaintsResponse)
        const nextTenancies = unwrapResults(tenanciesResponse)

        setComplaints(nextComplaints)
        setTenancies(nextTenancies)
        setSelectedComplaintId(nextComplaints[0]?.id || null)
        setForm((current) => ({
          ...current,
          tenancy: current.tenancy || String(nextTenancies[0]?.id || ""),
        }))
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load complaints.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadComplaintsWorkspace()

    return () => {
      isMounted = false
    }
  }, [])

  const selectedComplaint =
    complaints.find((complaint) => complaint.id === selectedComplaintId) || complaints[0] || null

  const complaintMessages = useMemo(
    () => buildComplaintMessages(selectedComplaint),
    [selectedComplaint],
  )

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!form.tenancy || !form.title || !form.description) {
      toast.error("Pick a tenancy, add a subject, and describe the issue first.")
      return
    }

    setIsSubmitting(true)
    try {
      const nextComplaint = await complaintsApi.create({
        category: form.category,
        description: form.description,
        tenancy: Number(form.tenancy),
        title: form.title,
      })

      setComplaints((current) => [nextComplaint, ...current])
      setSelectedComplaintId(nextComplaint.id)
      setForm((current) => ({
        ...current,
        description: "",
        title: "",
      }))
      toast.success("Complaint thread opened.")
    } catch (error) {
      toast.error(error.message || "Unable to open this complaint.")
    } finally {
      setIsSubmitting(false)
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
      eyebrow="Complaints"
      lede="Raise an issue against an active tenancy and follow the thread in a cleaner conversation-style workspace."
      title="Complaints and issue threads"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <AlertIcon className="ui-icon" />
          </div>
          <div>
            <span>Total threads</span>
            <strong>{complaints.length}</strong>
          </div>
        </article>
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <CalendarIcon className="ui-icon" />
          </div>
          <div>
            <span>Open issues</span>
            <strong>{complaints.filter((complaint) => complaint.status === "open").length}</strong>
          </div>
        </article>
      </section>

      <section className="tenant-complaints-layout">
        <TenantPanel eyebrow="Open a complaint" title="Start a new conversation">
          {tenancies.length ? (
            <form className="tenant-complaint-form" onSubmit={handleSubmit}>
              <label>
                Tenancy
                <select
                  className="form-control"
                  name="tenancy"
                  onChange={handleFieldChange}
                  value={form.tenancy}
                >
                  {tenancies.map((tenancy) => (
                    <option key={tenancy.id} value={tenancy.id}>
                      {tenancy.property_title} · {formatLabel(tenancy.status)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Category
                <select
                  className="form-control"
                  name="category"
                  onChange={handleFieldChange}
                  value={form.category}
                >
                  {complaintCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="tenant-complaint-form__full">
                Subject
                <input
                  className="form-control"
                  name="title"
                  onChange={handleFieldChange}
                  placeholder="Short title for the issue"
                  type="text"
                  value={form.title}
                />
              </label>

              <label className="tenant-complaint-form__full">
                Message
                <textarea
                  className="form-control"
                  name="description"
                  onChange={handleFieldChange}
                  placeholder="Describe the problem clearly"
                  rows="5"
                  value={form.description}
                />
              </label>

              <button className="btn btn-dark" disabled={isSubmitting} type="submit">
                <AlertIcon className="ui-icon" />
                {isSubmitting ? "Sending..." : "Open complaint"}
              </button>
            </form>
          ) : (
            <TenantEmptyState message="A tenancy must exist before a complaint can be opened." />
          )}
        </TenantPanel>

        <section className="tenant-complaints-thread">
          <TenantPanel eyebrow="Threads" title="Complaint conversations">
            {complaints.length ? (
              <div className="tenant-thread-list">
                {complaints.map((complaint) => (
                  <button
                    className={
                      complaint.id === selectedComplaintId
                        ? "tenant-thread-item is-active"
                        : "tenant-thread-item"
                    }
                    key={complaint.id}
                    onClick={() => setSelectedComplaintId(complaint.id)}
                    type="button"
                  >
                    <div className="tenant-thread-item__body">
                      <strong>{complaint.title}</strong>
                      <span>{complaint.property_title}</span>
                    </div>
                    <div className="tenant-thread-item__meta">
                      <span className={`tenant-status-pill tenant-status-pill--${complaint.status}`}>
                        {formatLabel(complaint.status)}
                      </span>
                      <ChevronRightIcon className="ui-icon ui-icon--muted" />
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <TenantEmptyState message="No complaint threads have been opened yet." />
            )}
          </TenantPanel>

          <TenantPanel eyebrow="Conversation" title={selectedComplaint?.title || "Select a thread"}>
            {selectedComplaint ? (
              <div className="tenant-chat-view">
                <div className="tenant-chat-view__summary">
                  <article>
                    <HomeIcon className="ui-icon ui-icon--muted" />
                    <div>
                      <span>Property</span>
                      <strong>{selectedComplaint.property_title}</strong>
                    </div>
                  </article>
                  <article>
                    <UsersIcon className="ui-icon ui-icon--muted" />
                    <div>
                      <span>Landlord</span>
                      <strong>{selectedComplaint.landlord_name}</strong>
                    </div>
                  </article>
                </div>

                <div className="tenant-chat-messages">
                  {complaintMessages.map((message) => (
                    <article
                      className={
                        message.side === "self"
                          ? "tenant-chat-bubble tenant-chat-bubble--self"
                          : "tenant-chat-bubble tenant-chat-bubble--system"
                      }
                      key={message.id}
                    >
                      <div className="tenant-chat-bubble__meta">
                        <strong>{message.label}</strong>
                        <span>{message.meta}</span>
                      </div>
                      <h4>{message.title}</h4>
                      <p>{message.body}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <TenantEmptyState message="Select a complaint thread to see the conversation." />
            )}
          </TenantPanel>
        </section>
      </section>
    </TenantWorkspacePage>
  )
}

export default Complaints
