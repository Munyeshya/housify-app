function PageBanner({ eyebrow, title, subtitle }) {
  return (
    <section className="page-banner">
      <div className="page-banner__content">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {subtitle ? <p className="lede">{subtitle}</p> : null}
      </div>
    </section>
  )
}

export default PageBanner
