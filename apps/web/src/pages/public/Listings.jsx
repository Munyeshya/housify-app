import { useEffect, useState } from "react"
import { FilterIcon, PinIcon, SearchIcon } from "../../components/common/Icons"
import PropertyCard from "../../components/PropertyCard"
import { propertiesApi } from "../../services/api"

function Listings() {
  const [properties, setProperties] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadProperties() {
      try {
        const response = await propertiesApi.listAvailablePublic()
        if (isMounted) {
          setProperties(Array.isArray(response) ? response : response?.results || [])
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

  return (
    <div className="public-stack">
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
            <section className="page-panel">
              <p className="lede">Loading available homes...</p>
            </section>
          ) : null}

          {errorMessage ? (
            <section className="page-panel">
              <p className="lede">{errorMessage}</p>
            </section>
          ) : null}

          {!isLoading && !errorMessage ? (
            <section className="property-grid property-grid--results">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
              {!properties.length ? (
                <article className="page-panel">
                  <p className="lede">There are no public rental homes available right now.</p>
                </article>
              ) : null}
            </section>
          ) : null}
        </div>
      </section>
    </div>
  )
}

export default Listings
