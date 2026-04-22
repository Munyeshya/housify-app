import { apiRequest } from "./client"
import { apiEndpoints } from "./endpoints"

const byRoleEndpoint = {
  admin: apiEndpoints.dashboards.admin,
  agent: apiEndpoints.dashboards.agent,
  landlord: apiEndpoints.dashboards.landlord,
  tenant: apiEndpoints.dashboards.tenant,
}

export const dashboardsApi = {
  getByRole(role, token) {
    const endpoint = byRoleEndpoint[role]
    if (!endpoint) {
      throw new Error("Unsupported dashboard role.")
    }
    return apiRequest(endpoint, {
      method: "GET",
      token,
    })
  },
}
