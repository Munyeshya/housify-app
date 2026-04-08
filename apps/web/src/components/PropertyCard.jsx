import { Link } from "react-router-dom"
import {
  ArrowRightIcon,
  BathIcon,
  BedIcon,
  CarIcon,
  HeartIcon,
  PinIcon,
} from "./common/Icons"
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
        <button className="property-card__save" type="button">
          <HeartIcon className="ui-icon ui-icon--tiny" />
        </button>
      </div>

      <div className="property-card__body">
        <h2>{property.title}</h2>
        <p className="property-card__location">
          <PinIcon className="ui-icon ui-icon--muted" />
          {formatLocation(property) || "Location pending"}
        </p>

        <dl className="property-card__stats">
          <div>
            <dt>Bedrooms</dt>
            <dd>
              <BedIcon className="ui-icon ui-icon--tiny" />
              {property.bedrooms ?? "-"}
            </dd>
          </div>
          <div>
            <dt>Bathrooms</dt>
            <dd>
              <BathIcon className="ui-icon ui-icon--tiny" />
              {property.bathrooms ?? "-"}
            </dd>
          </div>
          <div>
            <dt>Parking</dt>
            <dd>
              <CarIcon className="ui-icon ui-icon--tiny" />
              {property.parking_spaces ?? "-"}
            </dd>
          </div>
        </dl>

        <div className="property-card__footer">
          <strong className="property-card__price">
            {formatMoney(property.rent_amount, property.currency)}
          </strong>
          <Link
            aria-label={`View ${property.title}`}
            className="property-card__link property-card__link--icon"
            to={`/listings/${property.id}`}
          >
            <span>View</span>
            <ArrowRightIcon className="ui-icon ui-icon--tiny" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export default PropertyCard
