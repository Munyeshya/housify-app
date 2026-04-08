import { useEffect, useState } from "react"
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
      <section className="listing-intro page-panel">
        <div>
          <p className="eyebrow">Listings</p>
          <h1>Available rental homes</h1>
          <p className="lede">
            Review the homes that are currently open for rent, compare their
            location and rent, and open any property to mark your interest.
          </p>
        </div>
        <div className="listing-intro__summary">
          <strong>{properties.length}</strong>
          <span>public homes currently available</span>
        </div>
      </section>

      <section className="listing-browser">
        <aside className="listing-browser__filters">
          <div className="filter-card">
            <p className="eyebrow">Filter snapshot</p>
            <h2>Rental search</h2>
            <div className="filter-card__group">
              <span>Status</span>
              <strong>Available</strong>
            </div>
            <div className="filter-card__group">
              <span>Type</span>
              <strong>Houses, apartments, compounds</strong>
            </div>
            <div className="filter-card__group">
              <span>Pricing</span>
              <strong>Visible before you sign in</strong>
            </div>
          </div>
        </aside>

        <div className="listing-browser__results">
          <div className="listing-browser__map">
            <div className="listing-browser__map-card">
              <span>Map view</span>
              <strong>Property locations appear here as public listings with coordinates grow.</strong>
            </div>
          </div>

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
