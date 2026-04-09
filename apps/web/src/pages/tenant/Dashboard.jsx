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

function TenantDashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const response = await dashboardsApi.getTenantDashboard()
        if (isMounted) {
          setData(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load your tenant dashboard.")
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
        accent={data.has_legal_document ? "Legal document on file" : "No legal document uploaded yet"}
        eyebrow="Tenant workspace"
        lede="Follow your current residence, saved homes, payment progress, and issue history without leaving one place."
        title="Track the rental journey that belongs to you."
      />

      <DashboardSection eyebrow="Overview" title="Your rental activity">
        <DashboardStatGrid
          items={[
            { label: "saved homes", value: data.saved_property_count },
            { label: "current tenancy", value: data.current_tenancy_count },
            { label: "past tenancies", value: data.past_tenancy_count },
            { label: "legal document", value: data.has_legal_document ? 1 : 0 },
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Activity" title="Payments and complaints">
        <DashboardSnapshotGrid
          cards={[
            buildPaymentCards(data.payment_snapshot),
            buildComplaintCards(data.complaint_snapshot),
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Functions" title="What you can follow here">
        <DashboardActionGrid
          items={[
            {
              body: "Check how many homes you have saved and whether your current housing activity is still active.",
              eyebrow: "Bookmarks",
              title: "Keep your shortlist close",
            },
            {
              body: "Watch outstanding balances, paid rent, and any complaint status changes tied to your tenancy.",
              eyebrow: "Payments",
              title: "Stay on top of rental records",
            },
            {
              body: "Confirm whether your identification document is already on file for verification and access workflows.",
              eyebrow: "Documents",
              title: "Know your document status",
            },
          ]}
        />
      </DashboardSection>
    </div>
  )
}

export default TenantDashboard
