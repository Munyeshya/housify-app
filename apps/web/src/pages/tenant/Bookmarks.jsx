import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { DashboardError, DashboardLoading } from "../../components/dashboard/DashboardBlocks"
import {
  formatMoney,
  TenantEmptyState,
  TenantPanel,
  TenantWorkspacePage,
} from "../../components/tenant/TenantWorkspaceBlocks"
import { EyeIcon, HeartIcon, PinIcon } from "../../components/common/Icons"
import { bookmarksApi } from "../../services/api"
import { unwrapResults } from "../../services/api/response"

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let isMounted = true

    async function loadBookmarks() {
      try {
        const response = await bookmarksApi.list()
        if (isMounted) {
          setBookmarks(unwrapResults(response))
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load bookmarked homes.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBookmarks()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleRemoveBookmark(bookmarkId) {
    try {
      await bookmarksApi.delete(bookmarkId)
      setBookmarks((current) => current.filter((bookmark) => bookmark.id !== bookmarkId))
      toast.success("Bookmark removed.")
    } catch (error) {
      toast.error(error.message || "Unable to remove this bookmark.")
    }
  }

  if (isLoading) {
    return <DashboardLoading />
  }

  if (errorMessage) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <TenantWorkspacePage
      eyebrow="Bookmarks"
      lede="Saved homes stay here so you can compare rental options later without losing track of the properties that caught your attention."
      title="Saved homes"
    >
      <section className="tenant-overview-grid">
        <article className="tenant-overview-card">
          <div className="tenant-overview-card__icon">
            <HeartIcon className="ui-icon" />
          </div>
          <div>
            <span>Total saved</span>
            <strong>{bookmarks.length}</strong>
          </div>
        </article>
      </section>

      <TenantPanel eyebrow="Shortlist" title="Homes you bookmarked">
        {bookmarks.length ? (
          <div className="tenant-bookmark-grid">
            {bookmarks.map((bookmark) => {
              const property = bookmark.property || {}
              const location = [property.neighborhood, property.city].filter(Boolean).join(", ")

              return (
                <article className="tenant-bookmark-card" key={bookmark.id}>
                  <div className="tenant-bookmark-card__media">
                    {property.cover_image_url ? (
                      <img alt={property.title} src={property.cover_image_url} />
                    ) : (
                      <div className="tenant-bookmark-card__placeholder">No image yet</div>
                    )}
                  </div>
                  <div className="tenant-bookmark-card__body">
                    <div>
                      <h3>{property.title || "Saved listing"}</h3>
                      <p>
                        <PinIcon className="ui-icon ui-icon--muted" />
                        <span>{location || "Location pending"}</span>
                      </p>
                    </div>

                    <div className="tenant-bookmark-card__meta">
                      <span>{property.property_type || "Rental home"}</span>
                      <strong>{formatMoney(property.rent_amount, property.currency)}</strong>
                    </div>

                    <div className="tenant-bookmark-card__actions">
                      <Link className="btn btn-outline-dark" to={`/listings/${property.id}`}>
                        <EyeIcon className="ui-icon" />
                        View home
                      </Link>
                      <button
                        className="btn btn-dark"
                        onClick={() => handleRemoveBookmark(bookmark.id)}
                        type="button"
                      >
                        <HeartIcon className="ui-icon" />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <TenantEmptyState message="You have not bookmarked any homes yet." />
        )}
      </TenantPanel>
    </TenantWorkspacePage>
  )
}

export default Bookmarks
