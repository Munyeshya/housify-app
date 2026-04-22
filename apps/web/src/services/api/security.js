import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"

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

export const securityApi = {
  listEvents(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.security.events, query))
  },
  listFlags(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.security.flags, query))
  },
  createFlag(payload) {
    return apiClient.post(apiEndpoints.security.flags, payload)
  },
  decideFlag(flagId, payload) {
    return apiClient.post(apiEndpoints.security.flagDecision(flagId), payload)
  },
  listUsers(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.security.users, query))
  },
  suspendUser(userId, payload = {}) {
    return apiClient.post(apiEndpoints.security.suspendUser(userId), payload)
  },
  reactivateUser(userId, payload = {}) {
    return apiClient.post(apiEndpoints.security.reactivateUser(userId), payload)
  },
}
