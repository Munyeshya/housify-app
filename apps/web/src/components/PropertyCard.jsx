import { Link } from "react-router-dom"
import {
  formatLocation,
  formatMoney,
  getPropertyCover,
} from "../lib/propertyFormatters"

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
      </div>

      <div className="property-card__body">
        <div className="property-card__meta">
          <span>{property.property_type}</span>
          <strong>
            {formatMoney(property.rent_amount, property.currency)} /{" "}
            {property.billing_cycle}
          </strong>
        </div>

        <h2>{property.title}</h2>
        <p>{property.short_description}</p>

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
            <dt>Location</dt>
            <dd>{formatLocation(property) || "-"}</dd>
          </div>
        </dl>

        <Link className="property-card__link" to={`/listings/${property.id}`}>
          View home
        </Link>
      </div>
    </article>
  )
}

export default PropertyCard
