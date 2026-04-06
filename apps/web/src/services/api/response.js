export const isPaginatedResponse = (payload) =>
  Boolean(
    payload &&
      typeof payload === "object" &&
      Array.isArray(payload.results) &&
      typeof payload.count === "number",
  )

export function unwrapResults(payload) {
  return isPaginatedResponse(payload) ? payload.results : payload
}

export function getPaginationMeta(payload) {
  if (!isPaginatedResponse(payload)) {
    return null
  }

  return {
    count: payload.count,
    page: payload.page,
    pageSize: payload.page_size,
    numPages: payload.num_pages,
    next: payload.next,
    previous: payload.previous,
  }
}

export async function parseApiResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}
