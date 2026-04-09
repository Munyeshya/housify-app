import { useEffect, useMemo, useState } from "react"
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet"

import {
  ArrowRightIcon,
  ChevronLeftIcon,
  CloseIcon,
  GlobeIcon,
  PinIcon,
} from "./common/Icons"
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

function fitMarkerFocus(map, items, focusItem, level) {
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

function MapViewportController({ items, focusItem, level }) {
  const map = useMap()

  useEffect(() => {
    fitMarkerFocus(map, items, focusItem, level)
  }, [map, items, focusItem, level])

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
  const [items, setItems] = useState([])
  const [propertyPins, setPropertyPins] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const currentLevel = useMemo(() => getCurrentLevel(selection), [selection])
  const focusItem = useMemo(() => getDeepestSelection(selection), [selection])

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let isMounted = true

    async function loadLevel() {
      setIsLoading(true)
      setErrorMessage("")

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

        if (isMounted) {
          const nextItems = (Array.isArray(areaResponse) ? areaResponse : []).filter(
            (item) => Number(item.available_houses_count) > 0,
          )
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

  const activeTrail = [
    selection.district,
    selection.sector,
    selection.cell,
    selection.village,
  ].filter(Boolean)

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
                focusItem={focusItem}
                items={items}
                level={currentLevel}
              />

              {items.map((item) => {
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
              <div className="map-filter-panel__selection-grid">
                <article>
                  <span>District</span>
                  <strong>{selection.district?.name || "Any district"}</strong>
                </article>
                <article>
                  <span>Sector</span>
                  <strong>{selection.sector?.name || "Any sector"}</strong>
                </article>
                <article>
                  <span>Cell</span>
                  <strong>{selection.cell?.name || "Any cell"}</strong>
                </article>
                <article>
                  <span>Village</span>
                  <strong>{selection.village?.name || "Any village"}</strong>
                </article>
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

            <div className="map-filter-panel__list">
              <div className="map-filter-panel__list-heading">
                <h3>{LEVELS[currentLevel].label}</h3>
                <span>{items.length}</span>
              </div>

              {isLoading ? (
                <p className="map-filter-panel__empty">Loading map areas...</p>
              ) : null}

              {errorMessage ? <p className="map-filter-panel__empty">{errorMessage}</p> : null}

              {!isLoading && !errorMessage && !items.length ? (
                <p className="map-filter-panel__empty">{LEVELS[currentLevel].emptyMessage}</p>
              ) : null}

              {!isLoading && !errorMessage && items.length ? (
                <div className="map-filter-panel__items">
                  {items.map((item) => (
                    <button
                      className={`map-filter-panel__item${
                        focusItem?.id === item.id ? " is-active" : ""
                      }`}
                      key={`list-${currentLevel}-${item.id}`}
                      onClick={() => handleSelectItem(item)}
                      type="button"
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.available_houses_count} available homes</span>
                      </div>
                      <PinIcon className="ui-icon ui-icon--tiny" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

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
