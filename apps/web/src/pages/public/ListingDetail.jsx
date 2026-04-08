import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import PageBanner from "../../components/PageBanner"
import {
  formatLocation,
  formatMoney,
  getPropertyCover,
} from "../../lib/propertyFormatters"
import { useAuth } from "../../context/AuthContext"
import { bookmarksApi, propertiesApi } from "../../services/api"

function ListingDetail() {
  const { propertyId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [property, setProperty] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingInterest, setIsSavingInterest] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadProperty() {
      try {
        const response = await propertiesApi.getPublicPropertyById(propertyId)
        if (isMounted) {
          setProperty(response)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load this home right now.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProperty()

    return () => {
      isMounted = false
    }
  }, [propertyId])

  const gallery = useMemo(() => {
    if (!property) {
      return []
    }

    return property.images?.length ? property.images : []
  }, [property])

  async function handleBookmark() {
    if (!isAuthenticated) {
      toast("Sign in first to mark your interest in this home.")
      navigate("/login", { state: { from: `/listings/${propertyId}` } })
      return
    }

    if (user?.role !== "tenant") {
      toast.error("Only tenant accounts can bookmark homes.")
      return
    }

    try {
      setIsSavingInterest(true)
      await bookmarksApi.create(propertyId)
      toast.success("Your interest in this home has been saved.")
    } catch (error) {
      toast.error(error.message || "We could not save your interest right now.")
    } finally {
      setIsSavingInterest(false)
    }
  }

  if (isLoading) {
    return (
      <section className="page-panel">
        <p className="lede">Loading home details...</p>
      </section>
    )
  }

  if (errorMessage || !property) {
    return (
      <section className="page-panel">
        <p className="lede">{errorMessage || "This home could not be found."}</p>
        <div className="page-actions">
          <Link className="btn btn-dark" to="/listings">
            Back to listings
          </Link>
        </div>
      </section>
    )
  }

  const cover = getPropertyCover(property)

  return (
    <div className="public-stack">
      <PageBanner
        eyebrow={property.property_type}
        subtitle={formatLocation(property)}
        title={property.title}
      />

      <section className="listing-detail">
        <div className="listing-detail__hero">
          {cover ? <img alt={property.title} src={cover} /> : <div className="listing-detail__placeholder">No image available</div>}
        </div>

        <div className="listing-detail__body page-panel">
          <p className="eyebrow">Property details</p>
          <h2>{property.title}</h2>
          <p className="lede">{property.description || property.short_description}</p>

          <div className="listing-detail__pricing">
            <strong>{formatMoney(property.rent_amount, property.currency)}</strong>
            <span>per {property.billing_cycle}</span>
          </div>

          <dl className="listing-detail__facts">
            <div>
              <dt>Location</dt>
              <dd>{formatLocation(property)}</dd>
            </div>
            <div>
              <dt>Bedrooms</dt>
              <dd>{property.bedrooms ?? "-"}</dd>
            </div>
            <div>
              <dt>Bathrooms</dt>
              <dd>{property.bathrooms ?? "-"}</dd>
            </div>
            <div>
              <dt>Parking</dt>
              <dd>{property.parking_spaces ?? "-"}</dd>
            </div>
            <div>
              <dt>Deposit</dt>
              <dd>{formatMoney(property.security_deposit, property.currency)}</dd>
            </div>
            <div>
              <dt>Available from</dt>
              <dd>{property.available_from || "Available now"}</dd>
            </div>
          </dl>

          <div className="listing-detail__summary-grid">
            <article>
              <span>Utilities</span>
              <strong>{property.utilities_included || "Utilities not listed"}</strong>
            </article>
            <article>
              <span>House rules</span>
              <strong>{property.house_rules || "House rules will be shared by the landlord"}</strong>
            </article>
            <article>
              <span>Nearby landmarks</span>
              <strong>{property.nearby_landmarks || "Nearby landmarks not listed"}</strong>
            </article>
          </div>

          <div className="page-actions">
            <button
              className="btn btn-dark"
              disabled={isSavingInterest}
              onClick={handleBookmark}
              type="button"
            >
              {isSavingInterest ? "Saving..." : "Mark interest in this home"}
            </button>
            <Link className="btn btn-outline-dark" to="/listings">
              Back to listings
            </Link>
          </div>
        </div>
      </section>

      {gallery.length > 1 ? (
        <section className="gallery-grid">
          {gallery.slice(1).map((image) => (
            <figure className="gallery-card" key={image.id}>
              <img alt={image.caption || property.title} src={image.image_url} />
              {image.caption ? <figcaption>{image.caption}</figcaption> : null}
            </figure>
          ))}
        </section>
      ) : null}
    </div>
  )
}

export default ListingDetail
