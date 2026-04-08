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

export const bookmarksApi = {
  list(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.bookmarks.list, query))
  },
  create(propertyId) {
    return apiClient.post(apiEndpoints.bookmarks.list, { property: propertyId })
  },
  delete(bookmarkId) {
    return apiClient.delete(apiEndpoints.bookmarks.detail(bookmarkId))
  },
}
