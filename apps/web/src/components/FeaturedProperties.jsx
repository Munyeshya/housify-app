import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import PropertyCard from "./PropertyCard"
import SectionTitle from "./common/SectionTitle"
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
      <SectionTitle
        action={
          <Link className="btn btn-outline-dark" to="/listings">
            See all properties
          </Link>
        }
        badge="Featured listings"
        title="Homes currently attracting attention"
      />

      <div className="property-grid">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  )
}

export default FeaturedProperties
