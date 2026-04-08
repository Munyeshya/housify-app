import { Link } from "react-router-dom"

function Home() {
  return (
    <section className="page-panel page-panel--hero">
      <div className="page-copy">
        <p className="eyebrow">Homes you can trust</p>
        <h1>Find available rental homes and connect with responsive landlords.</h1>
        <p className="lede">
          Housify helps house seekers discover open listings, save the homes
          they like, and move into properties with clearer records, better
          communication, and structured property management behind the scenes.
        </p>
        <div className="page-actions">
          <Link className="btn btn-dark" to="/listings">
            View listings
          </Link>
          <Link className="btn btn-outline-dark" to="/about">
            How Housify works
          </Link>
        </div>
      </div>

      <div className="page-grid">
        <article className="info-block">
          <span>For house seekers</span>
          <strong>Browse available homes, compare prices, and save the ones you like.</strong>
        </article>
        <article className="info-block">
          <span>For landlords</span>
          <strong>Manage property visibility, occupancy, tenant records, and payments in one place.</strong>
        </article>
        <article className="info-block">
          <span>For everyone</span>
          <strong>Clearer records, better follow-up, and a safer rental journey from listing to tenancy.</strong>
        </article>
      </div>
    </section>
  )
}

export default Home
