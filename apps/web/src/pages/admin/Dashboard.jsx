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

function AdminDashboard() {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      try {
        const response = await dashboardsApi.getAdminDashboard()
        if (isMounted) {
          setData(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load the admin dashboard.")
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
        accent={`${data.users.find((item) => item.label === "admins")?.value || 0} platform admins`}
        eyebrow="Platform administration"
        lede="Oversee users, homes, tenancies, payments, complaints, legal documents, and verification access from one control layer."
        title="Monitor the platform with a system-wide view."
      />

      <DashboardSection eyebrow="Users" title="Account distribution">
        <DashboardStatGrid items={data.users} />
      </DashboardSection>

      <DashboardSection eyebrow="Inventory" title="Property and tenancy status">
        <DashboardSnapshotGrid
          cards={[
            {
              rows: data.properties.map((item) => ({
                label: item.label,
                value: item.value,
              })),
              title: "Properties",
              value: data.properties.find((item) => item.label === "total")?.value,
            },
            {
              rows: data.tenancies.map((item) => ({
                label: item.label,
                value: item.value,
              })),
              title: "Tenancies",
              value: data.tenancies.find((item) => item.label === "active")?.value,
            },
            buildPaymentCards(data.payment_snapshot),
            buildComplaintCards(data.complaint_snapshot),
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Verification" title="Documents and access control">
        <DashboardSnapshotGrid
          cards={[
            {
              rows: data.legal_documents.map((item) => ({
                label: item.label,
                value: item.value,
              })),
              title: "Legal documents",
              value: data.legal_documents.find((item) => item.label === "total")?.value,
            },
            {
              rows: data.verification_access.map((item) => ({
                label: item.label,
                value: item.value,
              })),
              title: "Verification access",
              value: data.verification_access.find((item) => item.label === "enabled")?.value,
            },
          ]}
        />
      </DashboardSection>

      <DashboardSection eyebrow="Functions" title="What you can oversee here">
        <DashboardActionGrid
          items={[
            {
              body: "Track how many landlords, tenants, agents, and admins are active across the system.",
              eyebrow: "Oversight",
              title: "See platform composition",
            },
            {
              body: "Watch public housing visibility, tenancy pressure, payment performance, and complaint load together.",
              eyebrow: "Operations",
              title: "Monitor platform health",
            },
            {
              body: "Review legal-document volume and landlord verification access across the full system.",
              eyebrow: "Verification",
              title: "Control high-trust access",
            },
          ]}
        />
      </DashboardSection>
    </div>
  )
}

export default AdminDashboard
