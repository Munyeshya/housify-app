function About() {
  return (
    <section className="page-panel">
      <p className="eyebrow">About Housify</p>
      <h1>A rental platform built for tenants, landlords, and managed properties.</h1>
      <p className="lede">
        Housify brings public property discovery together with structured rental
        management. Tenants can explore available homes and save the places
        they are serious about. Landlords can manage listings, occupancy,
        payments, complaints, records, and role-based access from one place.
      </p>

      <div className="feature-row">
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
      </div>
    </section>
  )
}

export default About
