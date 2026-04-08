import { Link } from "react-router-dom"

function Home() {
  return (
    <section className="page-panel page-panel--hero">
      <div className="page-copy">
        <p className="eyebrow">Available rentals for real tenancy decisions</p>
        <h1>Find a home, review the details, and register your interest with confidence.</h1>
        <p className="lede">
          Housify brings public rental listings together with structured
          property management. Tenants can browse open homes, compare pricing
          and location, and save the places they want to follow up on.
        </p>
        <div className="page-actions">
          <Link className="btn btn-dark" to="/listings">
            Browse listings
          </Link>
          <Link className="btn btn-outline-dark" to="/about">
            See how Housify works
          </Link>
        </div>
      </div>

      <div className="page-grid">
        <article className="info-block">
          <span>For tenants</span>
          <strong>Browse available homes, compare rent, and save the places you want to revisit.</strong>
        </article>
        <article className="info-block">
          <span>For landlords</span>
          <strong>Advertise open properties and manage occupancy, records, complaints, and payments in one place.</strong>
        </article>
        <article className="info-block">
          <span>For the whole rental journey</span>
          <strong>Move from listing to tenancy with clearer property information and better follow-up.</strong>
        </article>
      </div>
    </section>
  )
}

export default Home
