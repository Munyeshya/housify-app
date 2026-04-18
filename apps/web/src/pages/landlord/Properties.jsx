import { useEffect, useMemo, useState } from "react"
import { toast } from "react-hot-toast"
import {
  DashboardError,
  DashboardHero,
  DashboardLoading,
  DashboardSection,
} from "../../components/dashboard/DashboardBlocks"
import { DocumentIcon, EyeIcon, PinIcon } from "../../components/common/Icons"
import { getPaginationMeta, unwrapResults } from "../../services/api/response"
import { propertiesApi } from "../../services/api"

function formatMoney(value, currency = "RWF") {
  const amount = Number(value || 0)
  return new Intl.NumberFormat("en-RW", {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(amount)
}

function imagePreviewSource(image) {
  if (image.image_url) {
    return image.image_url
  }
  return ""
}

function buildDraft(image) {
  return {
    caption: image.caption || "",
    is_cover: Boolean(image.is_cover),
    sort_order: String(image.sort_order ?? 0),
  }
}

function LandlordProperties() {
  const [properties, setProperties] = useState([])
  const [propertiesMeta, setPropertiesMeta] = useState(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState(null)
  const [propertyImages, setPropertyImages] = useState([])
  const [imageDrafts, setImageDrafts] = useState({})
  const [isLoadingProperties, setIsLoadingProperties] = useState(true)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [busyVisibilityPropertyId, setBusyVisibilityPropertyId] = useState(null)
  const [busyImageId, setBusyImageId] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [uploadForm, setUploadForm] = useState({
    caption: "",
    image_file: null,
    sort_order: "0",
    is_cover: false,
  })

  const selectedProperty = useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) || null,
    [properties, selectedPropertyId],
  )

  useEffect(() => {
    let isMounted = true

    async function loadProperties() {
      try {
        const response = await propertiesApi.listManagedProperties()
        if (!isMounted) {
          return
        }

        const rows = unwrapResults(response)
        setProperties(rows)
        setPropertiesMeta(getPaginationMeta(response))

        if (rows.length > 0) {
          setSelectedPropertyId((current) => current ?? rows[0].id)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Unable to load landlord properties.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingProperties(false)
        }
      }
    }

    loadProperties()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadImages() {
      if (!selectedPropertyId) {
        setPropertyImages([])
        setImageDrafts({})
        return
      }

      setIsLoadingImages(true)
      try {
        const response = await propertiesApi.listPropertyImages(selectedPropertyId)
        if (!isMounted) {
          return
        }
        const rows = unwrapResults(response)
        setPropertyImages(rows)
        setImageDrafts(
          Object.fromEntries(rows.map((image) => [image.id, buildDraft(image)])),
        )
      } catch (error) {
        if (isMounted) {
          toast.error(error.message || "Unable to load property images.")
        }
      } finally {
        if (isMounted) {
          setIsLoadingImages(false)
        }
      }
    }

    loadImages()

    return () => {
      isMounted = false
    }
  }, [selectedPropertyId])

  async function refreshManagedProperties() {
    const response = await propertiesApi.listManagedProperties()
    const rows = unwrapResults(response)
    setProperties(rows)
    setPropertiesMeta(getPaginationMeta(response))
    if (!rows.find((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(rows[0]?.id || null)
    }
  }

  async function refreshSelectedPropertyImages() {
    if (!selectedPropertyId) {
      setPropertyImages([])
      setImageDrafts({})
      return
    }
    const response = await propertiesApi.listPropertyImages(selectedPropertyId)
    const rows = unwrapResults(response)
    setPropertyImages(rows)
    setImageDrafts(
      Object.fromEntries(rows.map((image) => [image.id, buildDraft(image)])),
    )
  }

  async function handleVisibilityToggle(property) {
    setBusyVisibilityPropertyId(property.id)
    try {
      if (property.is_public) {
        await propertiesApi.hideManagedProperty(property.id)
        toast.success("Property hidden from public listings.")
      } else {
        await propertiesApi.publishManagedProperty(property.id)
        toast.success("Property is now public.")
      }
      await refreshManagedProperties()
    } catch (error) {
      toast.error(error.message || "Unable to change public visibility for this property.")
    } finally {
      setBusyVisibilityPropertyId(null)
    }
  }

  function handleUploadFieldChange(event) {
    const { checked, files, name, type, value } = event.target
    setUploadForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : name === "image_file" ? files?.[0] || null : value,
    }))
  }

  async function handleUploadImage(event) {
    event.preventDefault()

    if (!selectedPropertyId) {
      toast.error("Select a property first.")
      return
    }
    if (!uploadForm.image_file) {
      toast.error("Choose an image file before uploading.")
      return
    }

    setIsUploadingImage(true)
    try {
      const payload = new FormData()
      payload.append("image_file", uploadForm.image_file)
      payload.append("caption", uploadForm.caption)
      payload.append("sort_order", uploadForm.sort_order || "0")
      payload.append("is_cover", String(uploadForm.is_cover))
      await propertiesApi.createPropertyImage(selectedPropertyId, payload)
      toast.success("Property photo uploaded.")
      setUploadForm({
        caption: "",
        image_file: null,
        sort_order: "0",
        is_cover: false,
      })
      await Promise.all([refreshSelectedPropertyImages(), refreshManagedProperties()])
    } catch (error) {
      toast.error(error.message || "Unable to upload this image.")
    } finally {
      setIsUploadingImage(false)
    }
  }

  function handleImageDraftChange(imageId, field, nextValue) {
    setImageDrafts((current) => ({
      ...current,
      [imageId]: {
        ...(current[imageId] || {}),
        [field]: nextValue,
      },
    }))
  }

  async function handleSaveImage(imageId) {
    const draft = imageDrafts[imageId]
    if (!draft) {
      return
    }

    setBusyImageId(imageId)
    try {
      await propertiesApi.updatePropertyImage(imageId, {
        caption: draft.caption,
        is_cover: Boolean(draft.is_cover),
        sort_order: Number(draft.sort_order || 0),
      })
      toast.success("Image details updated.")
      await Promise.all([refreshSelectedPropertyImages(), refreshManagedProperties()])
    } catch (error) {
      toast.error(error.message || "Unable to update this image.")
    } finally {
      setBusyImageId(null)
    }
  }

  async function handleDeleteImage(imageId) {
    setBusyImageId(imageId)
    try {
      await propertiesApi.deletePropertyImage(imageId)
      toast.success("Image deleted.")
      await Promise.all([refreshSelectedPropertyImages(), refreshManagedProperties()])
    } catch (error) {
      toast.error(error.message || "Unable to delete this image.")
    } finally {
      setBusyImageId(null)
    }
  }

  if (isLoadingProperties) {
    return <DashboardLoading />
  }

  if (errorMessage) {
    return <DashboardError message={errorMessage} />
  }

  return (
    <div className="dashboard-stack">
      <DashboardHero
        accent={`${propertiesMeta?.count ?? properties.length} properties`}
        eyebrow="Landlord properties"
        lede="Manage property visibility and upload house photos directly from this workspace."
        title="Property media and listing controls"
      />

      <DashboardSection eyebrow="Portfolio" title="Select a property to manage">
        {properties.length ? (
          <div className="landlord-property-list">
            {properties.map((property) => (
              <article
                className={
                  property.id === selectedPropertyId
                    ? "landlord-property-list__item is-active"
                    : "landlord-property-list__item"
                }
                key={property.id}
                onClick={() => setSelectedPropertyId(property.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelectedPropertyId(property.id)
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="landlord-property-list__item-main">
                  <strong>{property.title || property.name}</strong>
                  <span>{property.property_reference}</span>
                </div>
                <div className="landlord-property-list__item-meta">
                  <span>
                    <PinIcon className="ui-icon ui-icon--tiny" />
                    {property.neighborhood || property.city || "Location missing"}
                  </span>
                  <span>{formatMoney(property.rent_amount, property.currency)}</span>
                </div>
                <div className="landlord-property-list__item-actions">
                  <span className={property.is_public ? "tenant-status-pill tenant-status-pill--verified" : "tenant-status-pill tenant-status-pill--closed"}>
                    {property.is_public ? "Public" : "Private"}
                  </span>
                  <button
                    className="btn btn-outline-dark"
                    disabled={busyVisibilityPropertyId === property.id}
                    onClick={(event) => {
                      event.stopPropagation()
                      handleVisibilityToggle(property)
                    }}
                    type="button"
                  >
                    <EyeIcon className="ui-icon" />
                    {property.is_public ? "Hide" : "Publish"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="tenant-empty-state">No managed properties are available yet.</div>
        )}
      </DashboardSection>

      <DashboardSection eyebrow="Images" title="Upload and maintain property photos">
        {selectedProperty ? (
          <div className="landlord-property-manager">
            <article className="tenant-panel">
              <div className="tenant-panel__header">
                <div>
                  <p className="eyebrow">Upload</p>
                  <h3>{selectedProperty.title || selectedProperty.name}</h3>
                </div>
              </div>

              <form className="tenant-form-grid" onSubmit={handleUploadImage}>
                <label className="tenant-form-grid__full">
                  Photo file
                  <input
                    accept=".png,.jpg,.jpeg,.webp"
                    className="form-control"
                    name="image_file"
                    onChange={handleUploadFieldChange}
                    type="file"
                  />
                  <small className="tenant-field-hint">
                    {uploadForm.image_file ? uploadForm.image_file.name : "Accepted: PNG, JPG, JPEG, WEBP"}
                  </small>
                </label>

                <label>
                  Caption
                  <input
                    className="form-control"
                    name="caption"
                    onChange={handleUploadFieldChange}
                    placeholder="Front view, kitchen, bedroom..."
                    type="text"
                    value={uploadForm.caption}
                  />
                </label>

                <label>
                  Sort order
                  <input
                    className="form-control"
                    min="0"
                    name="sort_order"
                    onChange={handleUploadFieldChange}
                    step="1"
                    type="number"
                    value={uploadForm.sort_order}
                  />
                </label>

                <label className="tenant-form-grid__full landlord-property-manager__checkbox">
                  <input
                    checked={uploadForm.is_cover}
                    name="is_cover"
                    onChange={handleUploadFieldChange}
                    type="checkbox"
                  />
                  <span>Mark as cover photo</span>
                </label>

                <div className="tenant-form-grid__footer">
                  <button className="btn btn-dark" disabled={isUploadingImage} type="submit">
                    <DocumentIcon className="ui-icon" />
                    {isUploadingImage ? "Uploading..." : "Upload image"}
                  </button>
                </div>
              </form>
            </article>

            <article className="tenant-panel">
              <div className="tenant-panel__header">
                <div>
                  <p className="eyebrow">Gallery</p>
                  <h3>Current photos ({propertyImages.length})</h3>
                </div>
              </div>

              {isLoadingImages ? (
                <div className="tenant-empty-state">Loading images...</div>
              ) : propertyImages.length ? (
                <div className="landlord-image-grid">
                  {propertyImages.map((image) => {
                    const draft = imageDrafts[image.id] || buildDraft(image)
                    const preview = imagePreviewSource(image)
                    const isBusy = busyImageId === image.id

                    return (
                      <article className="landlord-image-card" key={image.id}>
                        <div className="landlord-image-card__media">
                          {preview ? (
                            <img alt={image.caption || "Property image"} src={preview} />
                          ) : (
                            <div className="property-card__placeholder">No preview available</div>
                          )}
                          {draft.is_cover ? (
                            <span className="landlord-image-card__cover-badge">Cover</span>
                          ) : null}
                        </div>

                        <div className="landlord-image-card__body">
                          <label>
                            Caption
                            <input
                              className="form-control"
                              onChange={(event) => handleImageDraftChange(image.id, "caption", event.target.value)}
                              type="text"
                              value={draft.caption}
                            />
                          </label>
                          <label>
                            Sort order
                            <input
                              className="form-control"
                              min="0"
                              onChange={(event) => handleImageDraftChange(image.id, "sort_order", event.target.value)}
                              step="1"
                              type="number"
                              value={draft.sort_order}
                            />
                          </label>
                          <label className="landlord-property-manager__checkbox">
                            <input
                              checked={Boolean(draft.is_cover)}
                              onChange={(event) => handleImageDraftChange(image.id, "is_cover", event.target.checked)}
                              type="checkbox"
                            />
                            <span>Cover photo</span>
                          </label>

                          <div className="landlord-image-card__actions">
                            <button
                              className="btn btn-outline-dark"
                              disabled={isBusy}
                              onClick={() => handleDeleteImage(image.id)}
                              type="button"
                            >
                              Delete
                            </button>
                            <button
                              className="btn btn-dark"
                              disabled={isBusy}
                              onClick={() => handleSaveImage(image.id)}
                              type="button"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="tenant-empty-state">
                  No images uploaded for this property yet.
                </div>
              )}
            </article>
          </div>
        ) : (
          <div className="tenant-empty-state">Select a property to manage its photos.</div>
        )}
      </DashboardSection>
    </div>
  )
}

export default LandlordProperties
