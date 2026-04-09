import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import PageBanner from "../../components/PageBanner"
import {
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CalendarIcon,
  CarIcon,
  PinIcon,
  WalletIcon,
} from "../../components/common/Icons"
import { formatLocation, formatMoney, getPropertyCover } from "../../lib/propertyFormatters"
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
  const description = property.description || property.short_description || "This home is available for rent."
  const propertyFacts = [
    {
      icon: <PinIcon className="ui-icon ui-icon--muted" />,
      label: "Location",
      value: formatLocation(property),
    },
    {
      icon: <BedIcon className="ui-icon ui-icon--muted" />,
      label: "Bedrooms",
      value: property.bedrooms ?? "-",
    },
    {
      icon: <BathIcon className="ui-icon ui-icon--muted" />,
      label: "Bathrooms",
      value: property.bathrooms ?? "-",
    },
    {
      icon: <CarIcon className="ui-icon ui-icon--muted" />,
      label: "Parking",
      value: property.parking_spaces ?? "-",
    },
    {
      icon: <WalletIcon className="ui-icon ui-icon--muted" />,
      label: "Deposit",
      value: formatMoney(property.security_deposit, property.currency),
    },
    {
      icon: <CalendarIcon className="ui-icon ui-icon--muted" />,
      label: "Available from",
      value: property.available_from || "Available now",
    },
  ]

  const detailSections = [
    {
      title: "Utilities",
      content: property.utilities_included || "Utilities will be shared by the landlord during booking.",
    },
    {
      title: "House rules",
      content: property.house_rules || "House rules will be shared after interest is confirmed.",
    },
    {
      title: "Nearby landmarks",
      content: property.nearby_landmarks || "Nearby landmarks have not been added yet.",
    },
  ]

  return (
    <div className="public-stack">
      <PageBanner
        eyebrow={property.property_type}
        subtitle={formatLocation(property)}
        title={property.title}
      />

      <section className="listing-detail">
        <div className="listing-detail__hero">
          {cover ? (
            <img alt={property.title} src={cover} />
          ) : (
            <div className="listing-detail__placeholder">No image available</div>
          )}
        </div>

        <div className="listing-detail__body page-panel">
          <p className="eyebrow">Property details</p>
          <div className="listing-detail__intro">
            <div className="listing-detail__heading">
              <h2>{property.title}</h2>
              <p>{description}</p>
            </div>

            <div className="listing-detail__rent-card">
              <span>Monthly rent</span>
              <strong>{formatMoney(property.rent_amount, property.currency)}</strong>
              <small>Charged per {property.billing_cycle}</small>
            </div>
          </div>

          <section className="listing-detail__section">
            <div className="listing-detail__section-heading">
              <div>
                <p className="eyebrow">Home facts</p>
                <h3>What this home offers</h3>
              </div>
            </div>

            <dl className="listing-detail__facts">
              {propertyFacts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>
                    <span className="listing-detail__fact-icon">{fact.icon}</span>
                    <div>
                      <small>{fact.label}</small>
                      <strong>{fact.value}</strong>
                    </div>
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="listing-detail__section">
            <div className="listing-detail__section-heading">
              <div>
                <p className="eyebrow">Rental summary</p>
                <h3>Terms and neighborhood details</h3>
              </div>
            </div>

            <div className="listing-detail__summary-grid">
              {detailSections.map((section) => (
                <article key={section.title}>
                  <span>{section.title}</span>
                  <strong>{section.content}</strong>
                </article>
              ))}
            </div>
          </section>

          <div className="page-actions listing-detail__actions">
            <button
              className="btn btn-dark"
              disabled={isSavingInterest}
              onClick={handleBookmark}
              type="button"
            >
              {isSavingInterest ? "Saving..." : "Mark interest in this home"}
            </button>
            <Link className="btn btn-outline-dark" to="/listings">
              View more homes
              <ArrowRightIcon className="ui-icon ui-icon--tiny" />
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
