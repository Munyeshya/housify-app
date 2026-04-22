import { apiRequest } from "./client"
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

export const paymentsApi = {
  list(token, query = {}) {
    return apiRequest(withQuery(apiEndpoints.payments.list, query), {
      method: "GET",
      token,
    })
  },
  submitTenant(token, payload) {
    return apiRequest(apiEndpoints.payments.tenantSubmit, {
      body: payload,
      method: "POST",
      token,
    })
  },
}
