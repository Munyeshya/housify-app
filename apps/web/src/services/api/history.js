import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"
import { unwrapResults } from "./response"

export const historyApi = {
  listLookups() {
    return apiClient.get(apiEndpoints.history.lookups)
  },
  async lookupTenant(payload) {
    const response = await apiClient.post(apiEndpoints.history.lookup, payload)
    return {
      lookup: response.lookup,
      summary: response.summary,
      tenantId: response.lookup?.tenant || null,
    }
  },
  async latestLookups() {
    const payload = await this.listLookups()
    return unwrapResults(payload)
  },
}
