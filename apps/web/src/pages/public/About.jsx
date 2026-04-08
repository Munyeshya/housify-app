function About() {
  return (
    <div className="public-stack">
      <section className="page-panel about-intro">
        <div className="page-copy">
          <p className="eyebrow">About Housify</p>
          <h1>A rental platform built for public discovery and structured property control.</h1>
          <p className="lede">
            Housify connects tenants looking for homes with landlords managing
            listings, occupancy, tenant records, complaints, and payment history.
            Public visitors can explore open rentals, while signed-in accounts
            unlock the deeper management side of the platform.
          </p>
        </div>

        <div className="about-intro__card">
          <span>What Housify connects</span>
          <strong>Listings, tenants, landlords, agents, and tenancy records</strong>
        </div>
      </section>

      <section className="feature-row">
        <article className="feature-card">
          <h2>Public listings</h2>
          <p>
            Available homes are shown with pricing, property type, and the practical
            information a tenant needs before making a decision.
          </p>
        </article>
        <article className="feature-card">
          <h2>Tenant interest</h2>
          <p>
            Signed-in tenant accounts can bookmark properties and come back to them
            later as they narrow down their options.
          </p>
        </article>
        <article className="feature-card">
          <h2>Landlord control</h2>
          <p>
            Landlords manage visibility, occupation, complaints, tenant history,
            agents, and payment records from a connected workspace.
          </p>
        </article>
      </section>
    </div>
  )
}

export default About
