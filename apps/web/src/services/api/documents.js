import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"
import { unwrapResults } from "./response"

export const documentsApi = {
  async getTenantLegalDocument() {
    const payload = await apiClient.get(apiEndpoints.documents.legalId)
    const documents = unwrapResults(payload)
    return Array.isArray(documents) ? documents[0] || null : documents
  },
  upsertTenantLegalDocument(payload) {
    if (payload instanceof FormData) {
      return apiClient.post(apiEndpoints.documents.legalId, payload)
    }

    const formData = new FormData()
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return
      }
      formData.append(key, value)
    })

    return apiClient.post(apiEndpoints.documents.legalId, formData)
  },
  deleteTenantLegalDocument(documentId) {
    return apiClient.delete(apiEndpoints.documents.legalIdDetail(documentId))
  },
}
