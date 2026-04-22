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

export const paymentsApi = {
  list(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.payments.list, query))
  },
  create(payload) {
    return apiClient.post(apiEndpoints.payments.list, payload)
  },
  submitTenantPayment(payload) {
    return apiClient.post(apiEndpoints.payments.tenantSubmit, payload)
  },
  listAdjustments(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.payments.adjustments, query))
  },
  createAdjustment(payload) {
    return apiClient.post(apiEndpoints.payments.adjustments, payload)
  },
  decideAdjustment(adjustmentId, payload) {
    return apiClient.post(apiEndpoints.payments.adjustmentDecision(adjustmentId), payload)
  },
  getIntegritySummary(paymentId) {
    return apiClient.get(apiEndpoints.payments.integrity(paymentId))
  },
}
