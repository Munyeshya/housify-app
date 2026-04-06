import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"

export const dashboardsApi = {
  getAdminDashboard() {
    return apiClient.get(apiEndpoints.dashboards.admin)
  },
  getLandlordDashboard() {
    return apiClient.get(apiEndpoints.dashboards.landlord)
  },
  getTenantDashboard() {
    return apiClient.get(apiEndpoints.dashboards.tenant)
  },
  getAgentDashboard() {
    return apiClient.get(apiEndpoints.dashboards.agent)
  },
}
