import shp from "shpjs"
import { webEnv } from "../config/env"

const GEOJSON_BASE = webEnv.geoJsonBaseUrl

const boundaryCache = new Map()

function normalizeText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
}

function getFeatureCollection(payload) {
  if (!payload) {
    return { type: "FeatureCollection", features: [] }
  }

  if (payload.type === "FeatureCollection") {
    return payload
  }

  if (Array.isArray(payload)) {
    const firstFeatureCollection = payload.find((entry) => entry?.type === "FeatureCollection")
    return firstFeatureCollection || { type: "FeatureCollection", features: [] }
  }

  return { type: "FeatureCollection", features: [] }
}

async function fetchGeoJson(path) {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Unable to load map boundaries from ${path}.`)
  }
  return response.json()
}

async function fetchDistrictBoundaryZip() {
  const response = await fetch(`${GEOJSON_BASE}/districts.zip`)
  if (!response.ok) {
    throw new Error("Unable to load district boundary archive.")
  }

  const buffer = await response.arrayBuffer()
  const payload = await shp(buffer)
  return getFeatureCollection(payload)
}

async function loadRawBoundaryCollection(level) {
  if (boundaryCache.has(level)) {
    return boundaryCache.get(level)
  }

  const nextPromise =
    level === "district"
      ? fetchDistrictBoundaryZip()
      : fetchGeoJson(`${GEOJSON_BASE}/${level}s.geojson`).then(getFeatureCollection)

  boundaryCache.set(level, nextPromise)
  return nextPromise
}

function getFeatureAreaKey(level, properties) {
  if (level === "district") {
    return normalizeText(properties.district)
  }

  if (level === "sector") {
    return `${normalizeText(properties.district)}::${normalizeText(properties.sector)}`
  }

  if (level === "cell") {
    return `${normalizeText(properties.district)}::${normalizeText(properties.sector)}::${normalizeText(properties.cell)}`
  }

  return `${normalizeText(properties.district)}::${normalizeText(properties.sector)}::${normalizeText(properties.cell)}::${normalizeText(properties.village)}`
}

function getItemAreaKey(level, item, selection) {
  if (level === "district") {
    return normalizeText(item.name)
  }

  if (level === "sector") {
    return `${normalizeText(selection.district?.name)}::${normalizeText(item.name)}`
  }

  if (level === "cell") {
    return `${normalizeText(selection.district?.name)}::${normalizeText(selection.sector?.name)}::${normalizeText(item.name)}`
  }

  return `${normalizeText(selection.district?.name)}::${normalizeText(selection.sector?.name)}::${normalizeText(selection.cell?.name)}::${normalizeText(item.name)}`
}

export async function loadBoundaryCollection(level, selection, items) {
  if (!items?.length || level === "village") {
    return null
  }

  const rawCollection = await loadRawBoundaryCollection(level)
  const itemLookup = new Map(
    items
      .filter((item) => Number(item.available_houses_count) > 0)
      .map((item) => [getItemAreaKey(level, item, selection), item]),
  )

  const features = rawCollection.features
    .map((feature) => {
      const matchedArea = itemLookup.get(getFeatureAreaKey(level, feature.properties || {}))
      if (!matchedArea) {
        return null
      }

      return {
        ...feature,
        properties: {
          ...feature.properties,
          __areaId: matchedArea.id,
          __areaName: matchedArea.name,
          __availableHousesCount: matchedArea.available_houses_count,
        },
      }
    })
    .filter(Boolean)

  return {
    type: "FeatureCollection",
    features,
  }
}

function collectCoordinates(coordinates, points) {
  if (!Array.isArray(coordinates)) {
    return
  }

  if (typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    points.push([coordinates[1], coordinates[0]])
    return
  }

  coordinates.forEach((entry) => collectCoordinates(entry, points))
}

export function getGeometryBounds(geometry) {
  if (!geometry) {
    return null
  }

  const points = []
  collectCoordinates(geometry.coordinates, points)

  if (!points.length) {
    return null
  }

  let minLat = points[0][0]
  let maxLat = points[0][0]
  let minLng = points[0][1]
  let maxLng = points[0][1]

  points.forEach(([lat, lng]) => {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  })

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}

export function getFeatureCollectionBounds(features) {
  if (!features?.length) {
    return null
  }

  let minLat = null
  let maxLat = null
  let minLng = null
  let maxLng = null

  features.forEach((feature) => {
    const bounds = getGeometryBounds(feature.geometry)
    if (!bounds) {
      return
    }

    const [[south, west], [north, east]] = bounds
    minLat = minLat === null ? south : Math.min(minLat, south)
    maxLat = maxLat === null ? north : Math.max(maxLat, north)
    minLng = minLng === null ? west : Math.min(minLng, west)
    maxLng = maxLng === null ? east : Math.max(maxLng, east)
  })

  if ([minLat, maxLat, minLng, maxLng].some((value) => value === null)) {
    return null
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}
