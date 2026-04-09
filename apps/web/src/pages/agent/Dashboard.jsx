import { useEffect, useState } from "react"
import { dashboardsApi } from "../../services/api"
import {
  buildComplaintCards,
  buildPaymentCards,
  DashboardActionGrid,
  DashboardError,
  DashboardHero,
  DashboardLoading,
  DashboardSection,
  DashboardSnapshotGrid,
  DashboardStatGrid,
} from "../../components/dashboard/DashboardBlocks"

function AgentDashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const response = await dashboardsApi.getAgentDashboard()
        if (isMounted) {
          setData(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load your agent dashboard.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return <DashboardLoading />
  }

  if (!data) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <div className="dashboard-stack">
      <DashboardHero
        accent={data.can_view_legal_id ? "Private agent access" : "Public agent access"}
        eyebrow="Agent workspace"
        lede="Track managed homes, active tenancies, and support activity across the properties currently assigned to you."
        title="See the homes and tenant activity you are trusted to manage."
      />

      <DashboardSection eyebrow="Overview" title="Managed scope">
        <DashboardStatGrid
          items={[
            { label: "managed properties", value: data.managed_property_count },
            { label: "active tenancies", value: data.managed_active_tenancy_count },
            { label: "legal id access", value: data.can_view_legal_id ? 1 : 0 },
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Operations" title="Payments and complaints">
        <DashboardSnapshotGrid
          cards={[
            buildPaymentCards(data.payment_snapshot),
            buildComplaintCards(data.complaint_snapshot),
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Functions" title="What you can handle here">
        <DashboardActionGrid
          items={[
            {
              body: "Follow the homes assigned to you and the active tenancies currently running inside them.",
              eyebrow: "Managed homes",
              title: "Stay inside your assigned scope",
            },
            {
              body: "Review how rent is moving and where payment follow-up may be needed across your managed homes.",
              eyebrow: "Payments",
              title: "Monitor collection pressure",
            },
            {
              body: "See whether your account type allows legal ID visibility for the tenants tied to your assigned properties.",
              eyebrow: "Permissions",
              title: "Know your access level",
            },
          ]}
        />
      </DashboardSection>
    </div>
  )
}

export default AgentDashboard
