import { Link } from "react-router-dom"
import { formatLocation, formatMoney, getPropertyCover } from "../lib/propertyFormatters"

function PropertyCard({ property }) {
  const coverImage = getPropertyCover(property)

  return (
    <article className="property-card">
      <div className="property-card__media">
        {coverImage ? (
          <img alt={property.title} src={coverImage} />
        ) : (
          <div className="property-card__placeholder">No image</div>
        )}
        <div className="property-card__badges">
          <span>Featured</span>
          <strong>{property.status}</strong>
        </div>
      </div>

      <div className="property-card__body">
        <h2>{property.title}</h2>
        <p className="property-card__location">
          {formatLocation(property) || "Location pending"}
        </p>

        <dl className="property-card__stats">
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
        </dl>

        <div className="property-card__footer">
          <strong className="property-card__price">
            {formatMoney(property.rent_amount, property.currency)}
          </strong>
          <Link className="property-card__link" to={`/listings/${property.id}`}>
            View home
          </Link>
        </div>
      </div>
    </article>
  )
}

export default PropertyCard
