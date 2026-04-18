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

export const complaintsApi = {
  list(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.complaints.list, query))
  },
  create(payload) {
    return apiClient.post(apiEndpoints.complaints.list, payload)
  },
}
