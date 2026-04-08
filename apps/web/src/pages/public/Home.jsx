import { Link } from "react-router-dom"
import FeaturedProperties from "../../components/FeaturedProperties"

function Home() {
  return (
    <div className="public-stack public-stack--wide">
      <section className="hero-showcase">
        <div className="hero-showcase__copy">
          <p className="eyebrow">Open homes across trusted landlord portfolios</p>
          <h1>Find the right rental home before you commit your interest.</h1>
          <p className="lede">
            Housify helps tenants discover available homes with clear pricing,
            location, and property details, while landlords manage visibility,
            records, and occupancy behind the scenes.
          </p>
          <div className="page-actions">
            <Link className="btn btn-dark" to="/listings">
              View all listings
            </Link>
            <Link className="btn btn-outline-dark" to="/contact">
              Talk to us
            </Link>
          </div>
        </div>

        <div className="hero-showcase__panel">
          <div className="hero-showcase__panel-header">
            <span>Now open</span>
            <strong>Available rentals</strong>
          </div>
          <div className="hero-showcase__metric-grid">
            <article>
              <strong>Rent</strong>
              <span>Homes with visible rent, deposit, and billing cycle details.</span>
            </article>
            <article>
              <strong>Interest</strong>
              <span>Signed-in tenants can save homes they want to follow up on.</span>
            </article>
            <article>
              <strong>Records</strong>
              <span>Landlords manage occupancy, complaints, and payment history in one system.</span>
            </article>
          </div>
        </div>
      </section>

      <section className="search-strip">
        <div className="search-strip__field">
          <span>Location</span>
          <strong>Kigali and nearby areas</strong>
        </div>
        <div className="search-strip__field">
          <span>Property type</span>
          <strong>Houses, apartments, compounds</strong>
        </div>
        <div className="search-strip__field">
          <span>For tenants</span>
          <strong>See details before marking interest</strong>
        </div>
        <Link className="btn btn-dark search-strip__button" to="/listings">
          Search listings
        </Link>
      </section>

      <section className="feature-row">
        <article className="feature-card">
          <h2>Public rental listings</h2>
          <p>
            Available homes are displayed with images, pricing, location, and
            the essentials tenants need to make a serious decision.
          </p>
        </article>
        <article className="feature-card">
          <h2>Landlord visibility control</h2>
          <p>
            Landlords choose which properties are public while still managing
            occupation and records privately inside their account.
          </p>
        </article>
        <article className="feature-card">
          <h2>Structured tenancy follow-up</h2>
          <p>
            Complaints, payments, and tenant history stay organized after a
            tenancy begins or even after someone moves out.
          </p>
        </article>
      </section>

      <section className="stats-band">
        <article>
          <strong>Public listings</strong>
          <span>Available homes advertised for tenants to review</span>
        </article>
        <article>
          <strong>Tenant interest</strong>
          <span>Bookmarks and follow-up begin after sign in</span>
        </article>
        <article>
          <strong>Landlord tools</strong>
          <span>Properties, tenants, agents, payments, and complaints</span>
        </article>
      </section>

      <FeaturedProperties />
    </div>
  )
}

export default Home
