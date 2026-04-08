import { useEffect, useState } from "react"
import { FilterIcon, PinIcon, SearchIcon } from "../../components/common/Icons"
import PropertyCard from "../../components/PropertyCard"
import PropertyCardSkeleton from "../../components/PropertyCardSkeleton"
import { propertiesApi } from "../../services/api"

const PAGE_SIZE = 16

function Listings() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    let isMounted = true

    async function loadProperties() {
      try {
        const response = await propertiesApi.listAvailablePublic()
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
  }, [])

  const totalPages = Math.max(1, Math.ceil(properties.length / PAGE_SIZE))
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visibleProperties = properties.slice(startIndex, startIndex + PAGE_SIZE)

  return (
    <div className="public-stack listing-page">
      <section className="listing-browser">
        <aside className="listing-browser__filters">
          <div className="filter-card">
            <p className="eyebrow">Explore</p>
            <h2>Filter homes</h2>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-location">
                <PinIcon />
                Location
              </label>
              <input
                className="form-control"
                id="filter-location"
                placeholder="Search by city or area"
              />
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-type">
                <FilterIcon />
                Property type
              </label>
              <select className="form-control" defaultValue="" id="filter-type">
                <option value="">All property types</option>
                <option>House</option>
                <option>Apartment</option>
                <option>Compound</option>
                <option>Studio</option>
              </select>
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-price">
                <SearchIcon />
                Budget
              </label>
              <select className="form-control" defaultValue="" id="filter-price">
                <option value="">Any budget</option>
                <option>Below 250,000</option>
                <option>250,000 - 500,000</option>
                <option>500,000 - 1,000,000</option>
                <option>Above 1,000,000</option>
              </select>
            </div>

            <div className="filter-card__group">
              <label className="filter-card__label" htmlFor="filter-status">
                <FilterIcon />
                Availability
              </label>
              <select className="form-control" defaultValue="Available" id="filter-status">
                <option>Available</option>
                <option>Any status</option>
              </select>
            </div>

            <div className="filter-card__actions">
              <button className="btn btn-dark" type="button">
                Apply filters
              </button>
              <button className="btn btn-outline-dark" type="button">
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
                  </div>

                  <div className="listing-pagination__controls">
                    <button
                      className="listing-pagination__button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      type="button"
                    >
                      Previous
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
                      className="listing-pagination__button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      type="button"
                    >
                      Next
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
                    <p className="lede">There are no public rental homes available right now.</p>
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
