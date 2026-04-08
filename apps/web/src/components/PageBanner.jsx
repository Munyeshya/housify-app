function PageBanner({ eyebrow, title, subtitle }) {
  return (
    <section className="page-banner">
      <div className="page-banner__overlay">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {subtitle ? <p className="lede">{subtitle}</p> : null}
      </div>
    </section>
  )
}

export default PageBanner
