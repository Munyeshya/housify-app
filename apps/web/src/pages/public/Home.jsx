import { Link } from "react-router-dom"

function Home() {
  return (
    <section className="page-panel page-panel--hero">
      <div className="page-copy">
        <p className="eyebrow">Warm Habitat direction</p>
        <h1>Human-centered structure for landlords, tenants, agents, and admins.</h1>
        <p className="lede">
          This shell is the starting point for the Housify web app. We are
          keeping the interface restrained, editorial, and practical while the
          real screens and data flows come next.
        </p>
        <div className="page-actions">
          <Link className="btn btn-dark" to="/login">
            Enter workspace
          </Link>
          <Link className="btn btn-outline-dark" to="/landlord/dashboard">
            Preview dashboard routes
          </Link>
        </div>
      </div>

      <div className="page-grid">
        <article className="info-block">
          <span>Public listings</span>
          <strong>Map-first browsing and property discovery</strong>
        </article>
        <article className="info-block">
          <span>Landlord control</span>
          <strong>Properties, tenants, payments, complaints, agents</strong>
        </article>
        <article className="info-block">
          <span>Verified records</span>
          <strong>Secure payment and legal-document access flows</strong>
        </article>
      </div>
    </section>
  )
}

export default Home
