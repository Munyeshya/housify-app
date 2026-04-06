import { apiEndpoints, buildApiUrl } from "./endpoints"
import { normalizeApiErrorPayload } from "./errors"
import { parseApiResponse } from "./response"
import { getStoredAuthToken } from "./storage"
import { webEnv } from "../../config/env"

const defaultHeaders = {
  Accept: "application/json",
}

const createAbortSignal = (timeoutMs) => {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)
  return {
    signal: controller.signal,
    clear: () => window.clearTimeout(timeoutId),
  }
}

export async function apiRequest(endpoint, options = {}) {
  const token = options.token ?? getStoredAuthToken()
  const headers = {
    ...defaultHeaders,
    ...options.headers,
  }
  if (token) {
    headers.Authorization = `Token ${token}`
  }

  const { signal, clear } = createAbortSignal(
    options.timeoutMs || webEnv.requestTimeoutMs,
  )

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
    if (error.name === "AbortError") {
      throw normalizeApiErrorPayload(
        { message: "The request timed out.", errors: [] },
        408,
      )
    }

    throw normalizeApiErrorPayload(
      { message: "Unable to reach the API.", errors: [] },
      503,
    )
  }

  clear()
  const payload = await parseApiResponse(response)

  if (!response.ok) {
    throw normalizeApiErrorPayload(payload, response.status)
  }

  return payload
}

export const apiClient = {
  get(endpoint, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: "GET",
    })
  },
  post(endpoint, body, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: "POST",
      body,
    })
  },
  patch(endpoint, body, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: "PATCH",
      body,
    })
  },
  delete(endpoint, options = {}) {
    return apiRequest(endpoint, {
      ...options,
      method: "DELETE",
    })
  },
}

export function getHealthStatus() {
  return apiClient.get(apiEndpoints.health)
}
