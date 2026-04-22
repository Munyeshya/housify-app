import { apiEndpoints, buildApiUrl } from "./endpoints"

const defaultHeaders = {
  Accept: "application/json",
}

const DEFAULT_TIMEOUT_MS = 15000

function createAbortSignal(timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  return {
    clear: () => clearTimeout(timeoutId),
    signal: controller.signal,
  }
}

function normalizeErrorMessage(payload, status) {
  if (payload && typeof payload === "object") {
    if (payload.detail) {
      return String(payload.detail)
    }
    if (payload.message) {
      return String(payload.message)
    }
    if (payload.errors && Array.isArray(payload.errors) && payload.errors.length) {
      return String(payload.errors[0])
    }
  }
  return `API request failed with status ${status}`
}

export async function apiRequest(endpoint, options = {}) {
  const token = options.token || ""
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }
  if (token) {
    headers.Authorization = `Token ${token}`
  }

  const { signal, clear } = createAbortSignal(options.timeoutMs)

  const requestOptions = {
    ...options,
    headers,
    signal,
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

  let response
  try {
    response = await fetch(buildApiUrl(endpoint), requestOptions)
  } catch (error) {
    clear()
    if (error?.name === "AbortError") {
      throw new Error("Request timed out.")
    }
    throw new Error("Unable to reach API.")
  }

  clear()
  if (!response.ok) {
    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
    throw new Error(normalizeErrorMessage(payload, response.status))
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
