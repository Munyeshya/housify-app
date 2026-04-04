import { apiEndpoints, buildApiUrl } from "./endpoints"

const defaultHeaders = {
  Accept: "application/json",
}

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }

  const requestOptions = {
    ...options,
    headers,
  }

  if (
    requestOptions.body &&
    typeof requestOptions.body === "object" &&
    !(requestOptions.body instanceof FormData)
  ) {
    requestOptions.body = JSON.stringify(requestOptions.body)
    requestOptions.headers = {
      "Content-Type": "application/json",
      ...headers,
    }
  }

  const response = await fetch(buildApiUrl(endpoint), requestOptions)

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`)
  }

  const contentType = response.headers.get("content-type") || ""
  if (contentType.includes("application/json")) {
    return response.json()
  }

  return response.text()
}

export function getHealthStatus() {
  return apiRequest(apiEndpoints.health)
}
