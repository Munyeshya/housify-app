import { mobileEnv } from "../../config/env"

const API_PREFIX = "/api/v1"

const normalizeEndpoint = (endpoint) =>
  endpoint.startsWith("/") ? endpoint : `/${endpoint}`

export const apiEndpoints = {
  health: "/health/",
  auth: {
    login: "/accounts/login/",
    logout: "/accounts/logout/",
    me: "/accounts/me/",
  },
  dashboards: {
    admin: "/dashboards/admin/",
    landlord: "/dashboards/landlord/",
    tenant: "/dashboards/tenant/",
    agent: "/dashboards/agent/",
  },
  properties: {
    publicList: "/properties/public/",
    publicDetail: (propertyId) => `/properties/public/${propertyId}/`,
  },
  bookmarks: {
    list: "/bookmarks/",
    detail: (bookmarkId) => `/bookmarks/${bookmarkId}/`,
  },
  payments: {
    list: "/payments/",
    tenantSubmit: "/payments/tenant/submit/",
  },
}

export const buildApiUrl = (endpoint) =>
  `${mobileEnv.apiBaseUrl}${API_PREFIX}${normalizeEndpoint(endpoint)}`
