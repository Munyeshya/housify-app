function PropertyCardSkeleton() {
  return (
    <article className="property-card property-card--skeleton" aria-hidden="true">
      <div className="property-card__media">
        <div className="skeleton-block skeleton-block--media" />
      </div>

      <div className="property-card__body">
        <div className="skeleton-stack">
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--location" />
        </div>

        <div className="property-card__stats">
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
          <div className="skeleton-pill" />
        </div>

        <div className="property-card__footer">
          <div className="skeleton-price" />
          <div className="skeleton-icon-button" />
        </div>
      </div>
    </article>
  )
}

export default PropertyCardSkeleton
