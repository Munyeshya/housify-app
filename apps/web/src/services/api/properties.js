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

export const propertiesApi = {
  listPublic(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.properties.publicList, query))
  },
  listAvailablePublic(query = {}) {
    return apiClient.get(
      withQuery(apiEndpoints.properties.publicList, {
        status: "available",
        ...query,
      }),
    )
  },
  getPublicPropertyById(propertyId) {
    return apiClient.get(apiEndpoints.properties.publicDetail(propertyId))
  },
  listLandlordPortfolios(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.properties.landlordPortfolios, query))
  },
  createLandlordPortfolio(payload) {
    return apiClient.post(apiEndpoints.properties.landlordPortfolios, payload)
  },
  updateLandlordPortfolio(portfolioId, payload) {
    return apiClient.patch(`${apiEndpoints.properties.landlordPortfolios}${portfolioId}/`, payload)
  },
  listManagedProperties(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.properties.landlordManage, query))
  },
  createManagedProperty(payload) {
    return apiClient.post(apiEndpoints.properties.landlordManage, payload)
  },
  updateManagedProperty(propertyId, payload) {
    return apiClient.patch(`${apiEndpoints.properties.landlordManage}${propertyId}/`, payload)
  },
  publishManagedProperty(propertyId) {
    return apiClient.post(`${apiEndpoints.properties.landlordManage}${propertyId}/publish/`, {})
  },
  hideManagedProperty(propertyId) {
    return apiClient.post(`${apiEndpoints.properties.landlordManage}${propertyId}/hide/`, {})
  },
  listPropertyImages(propertyId) {
    return apiClient.get(apiEndpoints.properties.landlordImages(propertyId))
  },
  createPropertyImage(propertyId, payload) {
    if (payload instanceof FormData) {
      return apiClient.post(apiEndpoints.properties.landlordImages(propertyId), payload)
    }
    return apiClient.post(apiEndpoints.properties.landlordImages(propertyId), payload)
  },
  updatePropertyImage(imageId, payload) {
    if (payload instanceof FormData) {
      return apiClient.patch(apiEndpoints.properties.imageDetail(imageId), payload)
    }
    return apiClient.patch(apiEndpoints.properties.imageDetail(imageId), payload)
  },
  deletePropertyImage(imageId) {
    return apiClient.delete(apiEndpoints.properties.imageDetail(imageId))
  },
}
