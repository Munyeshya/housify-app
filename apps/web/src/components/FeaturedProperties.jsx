import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import PropertyCard from "./PropertyCard"
import { propertiesApi } from "../services/api"

function FeaturedProperties() {
  const [properties, setProperties] = useState([])

  useEffect(() => {
    let isMounted = true

    async function loadFeatured() {
      try {
        const response = await propertiesApi.listAvailablePublic()
        const nextProperties = Array.isArray(response) ? response : response?.results || []

        if (isMounted) {
          setProperties(nextProperties.slice(0, 3))
        }
      } catch {
        if (isMounted) {
          setProperties([])
        }
      }
    }

    loadFeatured()

    return () => {
      isMounted = false
    }
  }, [])

  if (!properties.length) {
    return null
  }

  return (
    <section className="featured-properties">
      <div className="featured-properties__header">
        <div>
          <p className="eyebrow">Featured listings</p>
          <h2>Homes currently attracting attention</h2>
        </div>
        <Link className="btn btn-outline-dark" to="/listings">
          See all properties
        </Link>
      </div>

      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}

export default FeaturedProperties
