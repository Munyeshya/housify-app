import { useEffect, useMemo, useState } from "react"

import MapFilterPanel from "../../components/MapFilterPanel"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  FilterIcon,
  GlobeIcon,
  PinIcon,
  SearchIcon,
} from "../../components/common/Icons"
import PropertyCard from "../../components/PropertyCard"
import PropertyCardSkeleton from "../../components/PropertyCardSkeleton"
import { propertiesApi } from "../../services/api"

const PAGE_SIZE = 16

const emptyLocationSelection = {
  district: null,
  sector: null,
  cell: null,
  village: null,
}

function buildBudgetQuery(budget) {
  if (budget === "below-250000") {
    return { max_rent: 250000 }
  }
  if (budget === "250000-500000") {
    return { min_rent: 250000, max_rent: 500000 }
  }
  if (budget === "500000-1000000") {
    return { min_rent: 500000, max_rent: 1000000 }
  }
  if (budget === "above-1000000") {
    return { min_rent: 1000000 }
  }
  return {}
}

function getSelectionLabel(selection) {
  return (
    selection.village?.name ||
    selection.cell?.name ||
    selection.sector?.name ||
    selection.district?.name ||
    ""
  )
}

function Listings() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isMapModeOpen, setIsMapModeOpen] = useState(false)
  const [filters, setFilters] = useState({
    location: "",
    propertyType: "",
    budget: "",
  })
  const [selection, setSelection] = useState(emptyLocationSelection)

  const propertyQuery = useMemo(() => {
    const locationLabel = getSelectionLabel(selection)

    return {
      property_type: filters.propertyType || undefined,
      city: filters.location || undefined,
      district_area: selection.district?.id,
      sector_area: selection.sector?.id,
      cell_area: selection.cell?.id,
      village_area: selection.village?.id,
      ...buildBudgetQuery(filters.budget),
      locationLabel,
    }
  }, [filters, selection])

  useEffect(() => {
    let isMounted = true

    async function loadProperties() {
      setIsLoading(true)
      setErrorMessage("")

      try {
        const response = await propertiesApi.listAvailablePublic(propertyQuery)
        if (isMounted) {
          setProperties(Array.isArray(response) ? response : response?.results || [])
          setCurrentPage(1)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load listings right now.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProperties()

    return () => {
      isMounted = false
    }
  }, [propertyQuery])

  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visibleProperties = properties.slice(startIndex, startIndex + PAGE_SIZE)
  const selectionLabel = getSelectionLabel(selection)

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleResetFilters = () => {
    setFilters({
      location: "",
      propertyType: "",
      budget: "",
    })
    setSelection(emptyLocationSelection)
  }

  const handleClearSelection = () => {
    setSelection(emptyLocationSelection)
  }

  return (
    <div className="public-stack listing-page">
      <MapFilterPanel
        isOpen={isMapModeOpen}
        onClearSelection={handleClearSelection}
        onClose={() => setIsMapModeOpen(false)}
        onSelectionChange={setSelection}
        propertyQuery={propertyQuery}
        selection={selection}
      />

      <section className="listing-browser">
        <aside className="listing-browser__filters">
          <div className="filter-card">
            <div className="filter-card__heading">
              <div>
                <p className="eyebrow">Explore</p>
                <h2>Filter homes</h2>
              </div>

              <button
                className="filter-card__map-trigger"
                onClick={() => setIsMapModeOpen(true)}
                type="button"
              >
                <GlobeIcon className="ui-icon" />
              </button>
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-location">
                <PinIcon />
                City
              </label>
              <input
                className="form-control"
                id="filter-location"
                name="location"
                onChange={handleInputChange}
                placeholder="Search by city"
                value={filters.location}
              />
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-map">
                <GlobeIcon />
                Map guide
              </label>
              <button
                className="filter-card__map-selection"
                id="filter-map"
                onClick={() => setIsMapModeOpen(true)}
                type="button"
              >
                <strong>{selectionLabel || "Open Rwanda map"}</strong>
                <span>
                  {selectionLabel
                    ? "Drill deeper or close the map to keep this guide."
                    : "Select a district, sector, cell, or village."}
                </span>
              </button>
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-type">
                <FilterIcon />
                Property type
              </label>
              <select
                className="form-control"
                defaultValue=""
                id="filter-type"
                name="propertyType"
                onChange={handleInputChange}
                value={filters.propertyType}
              >
                <option value="">All property types</option>
                <option value="house">House</option>
                <option value="apartment">Apartment</option>
                <option value="compound">Compound</option>
                <option value="studio">Studio</option>
                <option value="room">Room</option>
              </select>
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-price">
                <SearchIcon />
                Budget
              </label>
              <select
                className="form-control"
                defaultValue=""
                id="filter-price"
                name="budget"
                onChange={handleInputChange}
                value={filters.budget}
              >
                <option value="">Any budget</option>
                <option value="below-250000">Below 250,000</option>
                <option value="250000-500000">250,000 - 500,000</option>
                <option value="500000-1000000">500,000 - 1,000,000</option>
                <option value="above-1000000">Above 1,000,000</option>
              </select>
            </div>

            <div className="filter-card__actions">
              <button className="btn btn-dark" onClick={() => setIsMapModeOpen(true)} type="button">
                Open map mode
              </button>
              <button className="btn btn-outline-dark" onClick={handleResetFilters} type="button">
                Reset
              </button>
            </div>
          </div>
        </aside>

        <div className="listing-browser__results">
          {isLoading ? (
            <section className="property-grid property-grid--results">
              {Array.from({ length: 6 }).map((_, index) => (
                <PropertyCardSkeleton key={`listing-skeleton-${index}`} />
              ))}
            </section>
          ) : null}

          {errorMessage ? (
            <section className="page-panel">
              <p className="lede">{errorMessage}</p>
            </section>
          ) : null}

          {!isLoading && !errorMessage ? (
            <>
              {properties.length ? (
                <div className="listing-pagination">
                  <div className="listing-pagination__summary">
                    Showing <strong>{startIndex + 1}</strong>-
                    <strong>{Math.min(startIndex + PAGE_SIZE, properties.length)}</strong> of{" "}
                    <strong>{properties.length}</strong> homes
                    {selectionLabel ? (
                      <>
                        {" "}
                        in <strong>{selectionLabel}</strong>
                      </>
                    ) : null}
                  </div>

                  <div className="listing-pagination__controls">
                    <button
                      aria-label="Previous page"
                      className="listing-pagination__button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      type="button"
                    >
                      <ChevronLeftIcon className="ui-icon ui-icon--tiny" />
                    </button>

                    <div className="listing-pagination__pages">
                      {Array.from({ length: totalPages }).map((_, index) => {
                        const page = index + 1

                        return (
                          <button
                            className={`listing-pagination__page${
                              page === currentPage ? " is-active" : ""
                            }`}
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            type="button"
                          >
                            {page}
                          </button>
                        )
                      })}
                    </div>

                    <button
                      aria-label="Next page"
                      className="listing-pagination__button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      type="button"
                    >
                      <ChevronRightIcon className="ui-icon ui-icon--tiny" />
                    </button>
                  </div>
                </div>
              ) : null}

              <section className="property-grid property-grid--results">
                {visibleProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
                {!properties.length ? (
                  <article className="page-panel">
                    <p className="lede">
                      There are no public rental homes available for the current guide.
                    </p>
                  </article>
                ) : null}
              </section>
            </>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default Listings
