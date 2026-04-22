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

export const propertiesApi = {
  listPublic(query = {}) {
    return apiRequest(withQuery(apiEndpoints.properties.publicList, query), {
      method: "GET",
    })
  },
  getPublicDetail(propertyId) {
    return apiRequest(apiEndpoints.properties.publicDetail(propertyId), {
      method: "GET",
    })
  },
}
