function About() {
  return (
    <div className="public-stack">
      <section className="page-panel about-hero">
        <div className="page-copy">
          <p className="eyebrow">About Housify</p>
          <h1>A rental platform built for tenants, landlords, and managed properties.</h1>
          <p className="lede">
            Housify connects public rental discovery with serious tenancy
            management. Tenants can find open homes and mark their interest.
            Landlords can manage listings, occupancy, records, agents,
            complaints, and payments in one system.
          </p>
        </div>
        <div className="about-hero__card">
          <span>What Housify connects</span>
          <strong>Listings, tenants, landlord control, and tenancy records</strong>
        </div>
      </section>

      <section className="feature-row">
        <article className="feature-card">
          <h2>Public listings</h2>
          <p>Open homes are presented with pricing, location, and the details tenants need before they enquire.</p>
        </article>
        <article className="feature-card">
          <h2>Tenant interest</h2>
          <p>Signed-in tenant accounts can bookmark homes and return to them when they are ready to proceed.</p>
        </article>
        <article className="feature-card">
          <h2>Landlord control</h2>
          <p>Property owners manage tenants, agents, payments, visibility, and the records behind each tenancy.</p>
        </article>
      </section>
    </div>
  )
}

export default About
