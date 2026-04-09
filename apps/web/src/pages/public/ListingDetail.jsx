import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"
import {
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CalendarIcon,
  CarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
  const [activeImageIndex, setActiveImageIndex] = useState(0)

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

    const images = property.images?.length
      ? property.images.map((image) => ({
          id: image.id,
          caption: image.caption,
          src: image.image_url,
        }))
      : []

    const cover = getPropertyCover(property)
    if (cover && !images.some((image) => image.src === cover)) {
      images.unshift({
        id: `cover-${property.id}`,
        caption: property.title,
        src: cover,
      })
    }

    return images
  }, [property])

  useEffect(() => {
    setActiveImageIndex(0)
  }, [propertyId])

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

  const description = property.description || property.short_description || "This home is available for rent."
  const activeImage = gallery[activeImageIndex] || null
  const googleMapsUrl =
    property.latitude && property.longitude
      ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formatLocation(property))}`
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
      title: "Location details",
      content: [
        property.village_area_name,
        property.cell_area_name,
        property.sector_area_name,
        property.district_area_name,
      ]
        .filter(Boolean)
        .join(", ") || "Detailed area information will be shared by the landlord.",
      action: googleMapsUrl,
    },
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

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) => {
      if (!gallery.length) {
        return currentIndex
      }

      return currentIndex === 0 ? gallery.length - 1 : currentIndex - 1
    })
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) => {
      if (!gallery.length) {
        return currentIndex
      }

      return currentIndex === gallery.length - 1 ? 0 : currentIndex + 1
    })
  }

  return (
    <div className="public-stack">
      <section className="listing-detail">
        <div className="listing-detail__hero">
          {activeImage ? (
            <>
              <img alt={activeImage.caption || property.title} src={activeImage.src} />

              {gallery.length > 1 ? (
                <>
                  <div className="listing-detail__hero-controls">
                    <button
                      aria-label="Previous image"
                      className="listing-detail__hero-button"
                      onClick={showPreviousImage}
                      type="button"
                    >
                      <ChevronLeftIcon className="ui-icon" />
                    </button>
                    <button
                      aria-label="Next image"
                      className="listing-detail__hero-button"
                      onClick={showNextImage}
                      type="button"
                    >
                      <ChevronRightIcon className="ui-icon" />
                    </button>
                  </div>

                  <div className="listing-detail__hero-thumbs">
                    {gallery.map((image, index) => (
                      <button
                        aria-label={`Show image ${index + 1}`}
                        className={`listing-detail__hero-thumb${index === activeImageIndex ? " is-active" : ""}`}
                        key={image.id}
                        onClick={() => setActiveImageIndex(index)}
                        type="button"
                      >
                        <img alt={image.caption || `${property.title} ${index + 1}`} src={image.src} />
                      </button>
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="listing-detail__placeholder">No image available</div>
          )}
        </div>

        <div className="listing-detail__body page-panel">
          <p className="eyebrow">Property details</p>
          <div className="listing-detail__heading">
            <div className="listing-detail__price-line">
              <strong>{formatMoney(property.rent_amount, property.currency)}</strong>
              <span>per {property.billing_cycle}</span>
            </div>
            <h2>{property.title}</h2>
            <p>{description}</p>
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

      <section className="listing-detail__meta-grid">
        {detailSections.map((section) => (
          <article className="listing-detail__meta-card" key={section.title}>
            <span>{section.title}</span>
            <strong>{section.content}</strong>
            {section.action ? (
              <a
                className="listing-detail__meta-link"
                href={section.action}
                rel="noreferrer"
                target="_blank"
              >
                Open in map
                <ArrowRightIcon className="ui-icon ui-icon--tiny" />
              </a>
            ) : null}
          </article>
        ))}
      </section>
    </div>
  )
}

export default ListingDetail
