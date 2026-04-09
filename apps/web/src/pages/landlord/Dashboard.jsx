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

function LandlordDashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const response = await dashboardsApi.getLandlordDashboard()
        if (isMounted) {
          setData(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load your landlord dashboard.")
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
        accent={`${data.public_listing_count} public homes live`}
        eyebrow="Landlord workspace"
        lede="Track occupancy, public visibility, payments, complaints, and active agents from one place."
        title="Manage the homes and rental activity under your care."
      />

      <DashboardSection eyebrow="Portfolio" title="Property status">
        <DashboardStatGrid items={data.property_stats} />
      </DashboardSection>

      <DashboardSection eyebrow="Occupancy" title="Tenancy flow">
        <DashboardStatGrid items={data.tenancy_stats} />
      </DashboardSection>

      <DashboardSection eyebrow="Operations" title="Payments and issues">
        <DashboardSnapshotGrid
          cards={[
            buildPaymentCards(data.payment_snapshot),
            buildComplaintCards(data.complaint_snapshot),
            {
              rows: [
                { label: "Public listings", value: data.public_listing_count },
                { label: "Private listings", value: data.private_listing_count },
                { label: "Active agents", value: data.active_agent_count },
              ],
              title: "Access and visibility",
              value: data.public_listing_count + data.private_listing_count,
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Functions" title="What you can handle here">
        <DashboardActionGrid
          items={[
            {
              body: "Review how many homes are public, private, available, occupied, or under maintenance.",
              eyebrow: "Portfolio",
              title: "Track property visibility",
            },
            {
              body: "Watch active, pending, completed, and terminated tenancies without leaving your workspace.",
              eyebrow: "Tenancies",
              title: "Follow occupancy status",
            },
            {
              body: "See payment progress, complaint pressure, and how many agents are currently attached to your homes.",
              eyebrow: "Operations",
              title: "Monitor rentals and support",
            },
          ]}
        />
      </DashboardSection>
    </div>
  )
}

export default LandlordDashboard
