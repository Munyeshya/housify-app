import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"

export const profilesApi = {
  getTenantProfile() {
    return apiClient.get(apiEndpoints.profiles.tenant)
  },
  updateTenantProfile(payload) {
    return apiClient.patch(apiEndpoints.profiles.tenant, payload)
  },
}
