import { webEnv } from "../../config/env"

const normalizeEndpoint = (endpoint) =>
  endpoint.startsWith("/") ? endpoint : `/${endpoint}`

export const apiEndpoints = {
  health: "/health/",
  auth: {
    login: "/accounts/login/",
    logout: "/accounts/logout/",
    me: "/accounts/me/",
    registerTenant: "/accounts/register/tenant/",
    registerLandlord: "/accounts/register/landlord/",
    registerAgent: "/accounts/register/agent/",
  },
  profiles: {
    landlord: "/accounts/profile/landlord/",
    tenant: "/accounts/profile/tenant/",
    agent: "/accounts/profile/agent/",
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
    landlordPortfolios: "/properties/portfolios/",
    landlordManage: "/properties/manage/",
    landlordImages: (propertyId) => `/properties/manage/${propertyId}/images/`,
    imageDetail: (imageId) => `/properties/images/${imageId}/`,
  },
  bookmarks: {
    list: "/bookmarks/",
    detail: (bookmarkId) => `/bookmarks/${bookmarkId}/`,
  },
  history: {
    lookups: "/history/lookups/",
    lookup: "/history/lookup/",
  },
  payments: {
    list: "/payments/",
    adjustments: "/payments/adjustments/",
    adjustmentDecision: (adjustmentId) =>
      `/payments/adjustments/${adjustmentId}/decision/`,
    integrity: (paymentId) => `/payments/${paymentId}/integrity/`,
  },
  complaints: {
    list: "/complaints/",
  },
  documents: {
    legalId: "/documents/legal-id/",
    legalIdDetail: (documentId) => `/documents/legal-id/${documentId}/`,
    legalIdAccess: "/documents/legal-id/access/",
    verificationAccess: "/documents/legal-id/verification-access/",
    myVerificationAccess: "/documents/legal-id/verification-access/me/",
    verifyTenantDocument: "/documents/legal-id/verify/",
  },
  locations: {
    publicMap: "/locations/public-map/",
    landlordMap: "/locations/landlord-map/",
    districtCounts: "/locations/counts/districts/",
    sectorCounts: (districtId) => `/locations/counts/districts/${districtId}/sectors/`,
    cellCounts: (sectorId) => `/locations/counts/sectors/${sectorId}/cells/`,
    villageCounts: (cellId) => `/locations/counts/cells/${cellId}/villages/`,
  },
  security: {
    events: "/security/events/",
    flags: "/security/flags/",
    flagDecision: (flagId) => `/security/flags/${flagId}/decision/`,
    users: "/security/users/",
    suspendUser: (userId) => `/security/users/${userId}/suspend/`,
    reactivateUser: (userId) => `/security/users/${userId}/reactivate/`,
  },
}

export const buildApiUrl = (endpoint) =>
  `${webEnv.apiBaseUrl}${webEnv.apiVersionPrefix}${normalizeEndpoint(endpoint)}`
