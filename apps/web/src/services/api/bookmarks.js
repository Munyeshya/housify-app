import { apiClient } from "./client"
import { apiEndpoints } from "./endpoints"

export const bookmarksApi = {
  list(query = {}) {
    const searchParams = new URLSearchParams()

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return
      }

      searchParams.set(key, String(value))
    })

    const queryString = searchParams.toString()
    const endpoint = queryString
      ? `${apiEndpoints.bookmarks.list}?${queryString}`
      : apiEndpoints.bookmarks.list

    return apiClient.get(endpoint)
  },
  create(propertyId) {
    return apiClient.post(apiEndpoints.bookmarks.list, { property: propertyId })
  },
  remove(bookmarkId) {
    return apiClient.delete(apiEndpoints.bookmarks.detail(bookmarkId))
  },
}
