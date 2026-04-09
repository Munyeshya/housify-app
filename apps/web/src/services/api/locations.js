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

export const locationsApi = {
  listPublicMap(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.locations.publicMap, query))
  },
  listDistrictCounts(query = {}) {
    return apiClient.get(withQuery(apiEndpoints.locations.districtCounts, query))
  },
  listSectorCounts(districtId, query = {}) {
    return apiClient.get(withQuery(apiEndpoints.locations.sectorCounts(districtId), query))
  },
  listCellCounts(sectorId, query = {}) {
    return apiClient.get(withQuery(apiEndpoints.locations.cellCounts(sectorId), query))
  },
  listVillageCounts(cellId, query = {}) {
    return apiClient.get(withQuery(apiEndpoints.locations.villageCounts(cellId), query))
  },
}
