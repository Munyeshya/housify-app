import { useEffect, useMemo, useState } from "react"
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet"

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  CloseIcon,
  GlobeIcon,
} from "./common/Icons"
import {
  getFeatureCollectionBounds,
  getGeometryBounds,
  loadBoundaryCollection,
} from "../lib/rwandaBoundaries"
import { locationsApi } from "../services/api"

const RWANDA_CENTER = [-1.9403, 29.8739]
const ROOT_ZOOM = 9

const LEVELS = {
  district: {
    label: "Districts",
    nextLevel: "sector",
    load: (query) => locationsApi.listDistrictCounts(query),
    emptyMessage: "No district counts are available yet.",
  },
  sector: {
    label: "Sectors",
    nextLevel: "cell",
    load: (query, selection) =>
      selection.district
        ? locationsApi.listSectorCounts(selection.district.id, query)
        : Promise.resolve([]),
    emptyMessage: "No sectors are available for this district.",
  },
  cell: {
    label: "Cells",
    nextLevel: "village",
    load: (query, selection) =>
      selection.sector
        ? locationsApi.listCellCounts(selection.sector.id, query)
        : Promise.resolve([]),
    emptyMessage: "No cells are available for this sector.",
  },
  village: {
    label: "Villages",
    nextLevel: null,
    load: (query, selection) =>
      selection.cell
        ? locationsApi.listVillageCounts(selection.cell.id, query)
        : Promise.resolve([]),
    emptyMessage: "No villages are available for this cell.",
  },
}

function fitMapFocus(map, boundaryCollection, items, focusItem, level) {
  const focusedBoundary = boundaryCollection?.features?.find(
    (feature) => feature.properties?.__areaId === focusItem?.id,
  )
  const focusedBounds = focusedBoundary ? getGeometryBounds(focusedBoundary.geometry) : null
  if (focusedBounds) {
    map.fitBounds(focusedBounds, {
      maxZoom: level === "district" ? 11 : level === "sector" ? 13 : 15,
      padding: [36, 36],
    })
    return
  }

  const collectionBounds = getFeatureCollectionBounds(boundaryCollection?.features)
  if (collectionBounds) {
    map.fitBounds(collectionBounds, { padding: [40, 40] })
    return
  }

  const validPoints = items
    .map((item) => [Number.parseFloat(item.center_latitude), Number.parseFloat(item.center_longitude)])
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng))

  if (focusItem?.center_latitude && focusItem?.center_longitude) {
    const lat = Number.parseFloat(focusItem.center_latitude)
    const lng = Number.parseFloat(focusItem.center_longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      map.flyTo([lat, lng], level === "district" ? 11 : level === "sector" ? 13 : 15, {
        duration: 0.65,
      })
      return
    }
  }

  if (validPoints.length > 1) {
    map.fitBounds(validPoints, { padding: [40, 40] })
    return
  }

  if (validPoints.length === 1) {
    map.flyTo(validPoints[0], 11, { duration: 0.65 })
    return
  }

  map.flyTo(RWANDA_CENTER, ROOT_ZOOM, { duration: 0.65 })
}

function getSelectionDepth(selection) {
  if (selection.village) {
    return 4
  }
  if (selection.cell) {
    return 3
  }
  if (selection.sector) {
    return 2
  }
  if (selection.district) {
    return 1
  }
  return 0
}

function collapseSelectionForZoom(selection, zoom) {
  if (zoom <= ROOT_ZOOM + 0.5) {
    return {
      district: null,
      sector: null,
      cell: null,
      village: null,
    }
  }

  if (zoom <= 11.6) {
    return {
      district: selection.district,
      sector: null,
      cell: null,
      village: null,
    }
  }

  if (zoom <= 13.2) {
    return {
      district: selection.district,
      sector: selection.sector,
      cell: null,
      village: null,
    }
  }

  if (zoom <= 14.6) {
    return {
      district: selection.district,
      sector: selection.sector,
      cell: selection.cell,
      village: null,
    }
  }

  return selection
}

function selectionsEqual(left, right) {
  return (
    left.district?.id === right.district?.id &&
    left.sector?.id === right.sector?.id &&
    left.cell?.id === right.cell?.id &&
    left.village?.id === right.village?.id
  )
}

function MapViewportController({
  boundaryCollection,
  items,
  focusItem,
  level,
  selection,
  onSelectionChange,
}) {
  const map = useMap()
  const selectionDepth = getSelectionDepth(selection)

  useEffect(() => {
    fitMapFocus(map, boundaryCollection, items, focusItem, level)
  }, [boundaryCollection, map, items, focusItem, level])

  useMapEvents({
    zoomend() {
      if (!selectionDepth) {
        return
      }

      const nextSelection = collapseSelectionForZoom(selection, map.getZoom())
      if (!selectionsEqual(selection, nextSelection)) {
        onSelectionChange(nextSelection)
      }
    },
  })

  return null
}

function markerRadius(count) {
  if (count >= 20) {
    return 18
  }
  if (count >= 10) {
    return 15
  }
  if (count >= 5) {
    return 12
  }
  return 10
}

function getDeepestSelection(selection) {
  return selection.village || selection.cell || selection.sector || selection.district || null
}

function getCurrentLevel(selection) {
  if (selection.cell) {
    return "village"
  }
  if (selection.sector) {
    return "cell"
  }
  if (selection.district) {
    return "sector"
  }
  return "district"
}

function createSelectionPath(selection, level, item) {
  if (level === "district") {
    return {
      district: item,
      sector: null,
      cell: null,
      village: null,
    }
  }

  if (level === "sector") {
    return {
      ...selection,
      sector: item,
      cell: null,
      village: null,
    }
  }

  if (level === "cell") {
    return {
      ...selection,
      cell: item,
      village: null,
    }
  }

  return {
    ...selection,
    village: item,
  }
}

export default function MapFilterPanel({
  isOpen,
  selection,
  propertyQuery,
  onClose,
  onSelectionChange,
  onClearSelection,
}) {
  const [boundaryCollection, setBoundaryCollection] = useState(null)
  const [items, setItems] = useState([])
  const [propertyPins, setPropertyPins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const currentLevel = useMemo(() => getCurrentLevel(selection), [selection])
  const focusItem = useMemo(() => getDeepestSelection(selection), [selection])
  const itemLookup = useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const districtOptions = currentLevel === "district" ? items : selection.district ? [selection.district] : []
  const sectorOptions = currentLevel === "sector" ? items : selection.sector ? [selection.sector] : []
  const cellOptions = currentLevel === "cell" ? items : selection.cell ? [selection.cell] : []
  const villageOptions = currentLevel === "village" ? items : selection.village ? [selection.village] : []

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isMounted = true

    async function loadLevel() {
      setIsLoading(true)
      setErrorMessage("")
      setBoundaryCollection(null)

      try {
        const query = {
          property_type: propertyQuery.property_type,
          city: propertyQuery.city,
          district_area: selection.district?.id,
          sector_area: selection.sector?.id,
          cell_area: selection.cell?.id,
          village_area: selection.village?.id,
          min_rent: propertyQuery.min_rent,
          max_rent: propertyQuery.max_rent,
        }

        const [areaResponse, mapResponse] = await Promise.all([
          LEVELS[currentLevel].load(query, selection),
          locationsApi.listPublicMap(query),
        ])

        const nextItems = (Array.isArray(areaResponse) ? areaResponse : []).filter(
          (item) => Number(item.available_houses_count) > 0,
        )

        let nextBoundaryCollection = null
        try {
          nextBoundaryCollection = await loadBoundaryCollection(currentLevel, selection, nextItems)
        } catch {
          nextBoundaryCollection = null
        }

        if (isMounted) {
          setBoundaryCollection(nextBoundaryCollection)
          setItems(nextItems)
          setPropertyPins(Array.isArray(mapResponse) ? mapResponse : [])
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load map areas right now.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLevel()

    return () => {
      isMounted = false
    }
  }, [isOpen, currentLevel, propertyQuery, selection])

  if (!isOpen) {
    return null
  }

  const handleSelectItem = (item) => {
    onSelectionChange(createSelectionPath(selection, currentLevel, item))
  }

  const handleStepBack = () => {
    if (currentLevel === "sector") {
      onSelectionChange({
        district: null,
        sector: null,
        cell: null,
        village: null,
      })
      return
    }

    if (currentLevel === "cell") {
      onSelectionChange({
        district: selection.district,
        sector: null,
        cell: null,
        village: null,
      })
      return
    }

    if (currentLevel === "village") {
      onSelectionChange({
        district: selection.district,
        sector: selection.sector,
        cell: null,
        village: null,
      })
    }
  }

  const handleLevelChange = (level, value) => {
    if (!value) {
      if (level === "district") {
        onSelectionChange({
          district: null,
          sector: null,
          cell: null,
          village: null,
        })
        return
      }
      if (level === "sector") {
        onSelectionChange({
          district: selection.district,
          sector: null,
          cell: null,
          village: null,
        })
        return
      }
      if (level === "cell") {
        onSelectionChange({
          district: selection.district,
          sector: selection.sector,
          cell: null,
          village: null,
        })
        return
      }
      onSelectionChange({
        district: selection.district,
        sector: selection.sector,
        cell: selection.cell,
        village: null,
      })
      return
    }

    const sourceItems =
      level === "district"
        ? districtOptions
        : level === "sector"
          ? sectorOptions
          : level === "cell"
            ? cellOptions
            : villageOptions
    const nextItem = sourceItems.find((item) => String(item.id) === value)
    if (!nextItem) {
      return
    }

    if (level === "district") {
      onSelectionChange({
        district: nextItem,
        sector: null,
        cell: null,
        village: null,
      })
      return
    }
    if (level === "sector") {
      onSelectionChange({
        district: selection.district,
        sector: nextItem,
        cell: null,
        village: null,
      })
      return
    }
    if (level === "cell") {
      onSelectionChange({
        district: selection.district,
        sector: selection.sector,
        cell: nextItem,
        village: null,
      })
      return
    }
    onSelectionChange({
      district: selection.district,
      sector: selection.sector,
      cell: selection.cell,
      village: nextItem,
    })
  }

  const activeTrail = [
    selection.district,
    selection.sector,
    selection.cell,
    selection.village,
  ].filter(Boolean)
  const hasBoundaryPolygons = Boolean(boundaryCollection?.features?.length)

  const getBoundaryPathOptions = (feature) => {
    const count = Number(feature.properties?.__availableHousesCount || 0)
    const isSelected = feature.properties?.__areaId === focusItem?.id

    return {
      color: isSelected ? "#14532d" : "#166534",
      fillColor: isSelected ? "#84cc16" : count >= 20 ? "#86efac" : count >= 10 ? "#bbf7d0" : "#dcfce7",
      fillOpacity: isSelected ? 0.48 : 0.26,
      opacity: 1,
      weight: isSelected ? 2.6 : 1.5,
    }
  }

  return (
    <div className="map-filter-panel">
      <button
        aria-label="Close map mode"
        className="map-filter-panel__backdrop"
        onClick={onClose}
        type="button"
      />

      <section className="map-filter-panel__dialog">
        <header className="map-filter-panel__header">
          <div>
            <p className="eyebrow">Map mode</p>
            <h2>Browse available homes by area</h2>
          </div>

          <div className="map-filter-panel__header-actions">
            {currentLevel !== "district" ? (
              <button className="map-filter-panel__ghost" onClick={handleStepBack} type="button">
                <ChevronLeftIcon className="ui-icon ui-icon--tiny" />
                Back
              </button>
            ) : null}

            <button className="map-filter-panel__close" onClick={onClose} type="button">
              <CloseIcon className="ui-icon" />
            </button>
          </div>
        </header>

        <div className="map-filter-panel__body">
          <div className="map-filter-panel__map-shell">
            <MapContainer
              center={RWANDA_CENTER}
              className="map-filter-panel__map"
              scrollWheelZoom
              zoom={ROOT_ZOOM}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapViewportController
                boundaryCollection={boundaryCollection}
                focusItem={focusItem}
                items={items}
                level={currentLevel}
                onSelectionChange={onSelectionChange}
                selection={selection}
              />

              {hasBoundaryPolygons
                ? boundaryCollection.features.map((feature) => {
                    const matchedItem = itemLookup.get(feature.properties?.__areaId)
                    if (!matchedItem) {
                      return null
                    }

                    return (
                      <GeoJSON
                        data={feature}
                        eventHandlers={{
                          click: () => handleSelectItem(matchedItem),
                        }}
                        key={`boundary-${currentLevel}-${matchedItem.id}`}
                        onEachFeature={(featureData, layer) => {
                          layer.bindTooltip(
                            `${featureData.properties?.__areaName}: ${featureData.properties?.__availableHousesCount} available homes`,
                            {
                              direction: "top",
                              sticky: true,
                            },
                          )
                        }}
                        pathOptions={getBoundaryPathOptions(feature)}
                      />
                    )
                  })
                : items.map((item) => {
                const lat = Number.parseFloat(item.center_latitude)
                const lng = Number.parseFloat(item.center_longitude)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                  return null
                }

                const isSelected = focusItem?.id === item.id

                return (
                  <CircleMarker
                    center={[lat, lng]}
                    eventHandlers={{ click: () => handleSelectItem(item) }}
                    fillColor={isSelected ? "#14532d" : "#84cc16"}
                    fillOpacity={0.88}
                    key={`${currentLevel}-${item.id}`}
                    pathOptions={{
                      color: isSelected ? "#14532d" : "#166534",
                      weight: isSelected ? 3 : 2,
                    }}
                    radius={markerRadius(item.available_houses_count)}
                  >
                    <Tooltip direction="top" opacity={1} permanent={isSelected}>
                      <div className="map-filter-panel__tooltip">
                        <strong>{item.name}</strong>
                        <span>{item.available_houses_count} available homes</span>
                      </div>
                    </Tooltip>
                  </CircleMarker>
                )
                  })}

              {propertyPins.map((property) => {
                const lat = Number.parseFloat(property.latitude)
                const lng = Number.parseFloat(property.longitude)
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                  return null
                }

                const mapsHref = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`

                return (
                  <CircleMarker
                    center={[lat, lng]}
                    fillColor="#ffffff"
                    fillOpacity={1}
                    key={`property-pin-${property.id}`}
                    pathOptions={{
                      color: "#166534",
                      weight: 2,
                    }}
                    radius={6}
                  >
                    <Popup>
                      <div className="map-filter-panel__property-popup">
                        <strong>{property.title}</strong>
                        <span>{property.neighborhood || property.city}</span>
                        <span>
                          {property.currency} {Number(property.rent_amount).toLocaleString()}
                        </span>
                        <a href={mapsHref} rel="noreferrer" target="_blank">
                          Open in Google Maps
                          <ArrowRightIcon className="ui-icon ui-icon--tiny" />
                        </a>
                      </div>
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>

          <aside className="map-filter-panel__sidebar">
            <div className="map-filter-panel__trail">
              <div className="map-filter-panel__trail-icon">
                <GlobeIcon className="ui-icon" />
              </div>
              <div>
                <strong>{LEVELS[currentLevel].label}</strong>
                <p>
                  {activeTrail.length
                    ? activeTrail.map((item) => item.name).join(" / ")
                    : "Rwanda"}
                </p>
              </div>
            </div>

            <div className="map-filter-panel__selection-card">
              <h3>Current guide</h3>
              <div className="map-filter-panel__selection-dropdowns">
                <label className="map-filter-panel__field">
                  <span>District</span>
                  <select
                    className="form-control"
                    onChange={(event) => handleLevelChange("district", event.target.value)}
                    value={selection.district?.id || ""}
                  >
                    <option value="">Any district</option>
                    {districtOptions.map((item) => (
                      <option key={`district-option-${item.id}`} value={item.id}>
                        {item.name} ({item.available_houses_count})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="map-filter-panel__field">
                  <span>Sector</span>
                  <select
                    className="form-control"
                    disabled={!selection.district}
                    onChange={(event) => handleLevelChange("sector", event.target.value)}
                    value={selection.sector?.id || ""}
                  >
                    <option value="">{selection.district ? "Any sector" : "Select district first"}</option>
                    {sectorOptions.map((item) => (
                      <option key={`sector-option-${item.id}`} value={item.id}>
                        {item.name} ({item.available_houses_count})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="map-filter-panel__field">
                  <span>Cell</span>
                  <select
                    className="form-control"
                    disabled={!selection.sector}
                    onChange={(event) => handleLevelChange("cell", event.target.value)}
                    value={selection.cell?.id || ""}
                  >
                    <option value="">{selection.sector ? "Any cell" : "Select sector first"}</option>
                    {cellOptions.map((item) => (
                      <option key={`cell-option-${item.id}`} value={item.id}>
                        {item.name} ({item.available_houses_count})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="map-filter-panel__field">
                  <span>Village</span>
                  <select
                    className="form-control"
                    disabled={!selection.cell}
                    onChange={(event) => handleLevelChange("village", event.target.value)}
                    value={selection.village?.id || ""}
                  >
                    <option value="">{selection.cell ? "Any village" : "Select cell first"}</option>
                    {villageOptions.map((item) => (
                      <option key={`village-option-${item.id}`} value={item.id}>
                        {item.name} ({item.available_houses_count})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {focusItem?.center_latitude && focusItem?.center_longitude ? (
                <a
                  className="map-filter-panel__maps-link"
                  href={`https://www.google.com/maps/search/?api=1&query=${focusItem.center_latitude},${focusItem.center_longitude}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Follow in Google Maps
                  <ArrowRightIcon className="ui-icon ui-icon--tiny" />
                </a>
              ) : null}
            </div>

            {isLoading ? (
              <p className="map-filter-panel__empty">Loading map areas...</p>
            ) : null}

            {errorMessage ? <p className="map-filter-panel__empty">{errorMessage}</p> : null}

            {!isLoading && !errorMessage && !items.length ? (
              <p className="map-filter-panel__empty">{LEVELS[currentLevel].emptyMessage}</p>
            ) : null}

            <div className="map-filter-panel__actions">
              <button className="btn btn-dark" onClick={onClose} type="button">
                Use this area
              </button>
              <button className="btn btn-outline-dark" onClick={onClearSelection} type="button">
                Clear map guide
              </button>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
