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
      <section className="page-panel">
        <p className="eyebrow">Listings</p>
        <h1>Available homes</h1>
        <p className="lede">
          Explore the homes that are currently open for rent and view their
          details before you decide where to apply your interest.
        </p>
      </section>

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
        <section className="property-grid">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
          {!properties.length ? (
            <article className="page-panel">
              <p className="lede">There are no public homes available right now.</p>
            </article>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}

export default Listings
