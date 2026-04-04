import { mobileEnv } from "../../config/env"

const API_PREFIX = "/api/v1"

const normalizeEndpoint = (endpoint) =>
  endpoint.startsWith("/") ? endpoint : `/${endpoint}`

export const apiEndpoints = {
  health: "/health/",
}

export const buildApiUrl = (endpoint) =>
  `${mobileEnv.apiBaseUrl}${API_PREFIX}${normalizeEndpoint(endpoint)}`
