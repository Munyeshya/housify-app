import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"
import { unwrapResults } from "./response"

const withQuery = (endpoint, query = {}) => {
  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return
    }
    searchParams.set(key, String(value))
  })

  const queryString = searchParams.toString()
  return queryString ? `${endpoint}?${queryString}` : endpoint
}

export const agentsApi = {
  listAvailable() {
    return apiClient.get(apiEndpoints.agents.available)
  },
  createPrivate(payload) {
    return apiClient.post(apiEndpoints.agents.private, payload)
  },
  deletePrivate(agentId) {
    return apiClient.delete(apiEndpoints.agents.privateDetail(agentId))
  },
  listAssignments(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.agents.assignments, query))
  },
  createAssignment(payload) {
    return apiClient.post(apiEndpoints.agents.assignments, payload)
  },
  revokeAssignment(assignmentId) {
    return apiClient.post(apiEndpoints.agents.revokeAssignment(assignmentId), {})
  },
  listManagedProperties(agentId) {
    return apiClient.get(apiEndpoints.agents.managedProperties(agentId))
  },
  listManagedPayments(agentId) {
    return apiClient.get(apiEndpoints.agents.managedPayments(agentId))
  },
  listManagedComplaints(agentId) {
    return apiClient.get(apiEndpoints.agents.managedComplaints(agentId))
  },
  async summarizeManagedScope(agentId) {
    const [propertiesPayload, paymentsPayload, complaintsPayload] = await Promise.all([
      this.listManagedProperties(agentId),
      this.listManagedPayments(agentId),
      this.listManagedComplaints(agentId),
    ])

    const properties = unwrapResults(propertiesPayload)
    const payments = unwrapResults(paymentsPayload)
    const complaints = unwrapResults(complaintsPayload)

    return { complaints, payments, properties }
  },
}
