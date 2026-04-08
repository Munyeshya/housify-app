function About() {
  return (
    <section className="page-panel">
      <p className="eyebrow">About Housify</p>
      <h1>A rental platform for both house seekers and landlords.</h1>
      <p className="lede">
        Housify brings public property discovery together with structured rental
        management. House seekers can explore available homes and save the ones
        they are interested in. Landlords can manage listings, occupancy,
        records, complaints, and payments from one place.
      </p>

      <div className="feature-row">
        <article className="feature-card">
          <h2>Public listings</h2>
          <p>Available homes can be advertised clearly with pricing, location, and images.</p>
        </article>
        <article className="feature-card">
          <h2>Interest and follow-up</h2>
          <p>Signed-in users can bookmark homes and return to them when making decisions.</p>
        </article>
        <article className="feature-card">
          <h2>Landlord control</h2>
          <p>Property owners manage tenants, records, agents, complaints, and visibility.</p>
        </article>
      </div>
    </section>
  )
}

export default About
