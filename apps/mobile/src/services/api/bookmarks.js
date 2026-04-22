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

export const bookmarksApi = {
  list(token, query = {}) {
    return apiRequest(withQuery(apiEndpoints.bookmarks.list, query), {
      method: "GET",
      token,
    })
  },
  create(token, propertyId) {
    return apiRequest(apiEndpoints.bookmarks.list, {
      body: { property: propertyId },
      method: "POST",
      token,
    })
  },
  remove(token, bookmarkId) {
    return apiRequest(apiEndpoints.bookmarks.detail(bookmarkId), {
      method: "DELETE",
      token,
    })
  },
}
