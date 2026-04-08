import { Link } from "react-router-dom"
import FeaturedProperties from "../../components/FeaturedProperties"

function Home() {
  return (
    <div className="public-stack public-stack--wide">
      <section className="hero-showcase">
        <div className="hero-showcase__copy">
          <p className="eyebrow">Available homes across trusted landlord portfolios</p>
          <h1>Rental homes for people who want clearer property details.</h1>
          <p className="lede">
            Browse homes that are currently open for rent, check the details
            that matter, and mark your interest once you are ready to follow up.
          </p>
          <div className="page-actions">
            <Link className="btn btn-dark" to="/listings">
              View all listings
            </Link>
            <Link className="btn btn-outline-dark" to="/about">
              Learn more
            </Link>
          </div>
        </div>

        <div className="hero-showcase__gallery">
          <div className="hero-showcase__frame hero-showcase__frame--tall" />
          <div className="hero-showcase__frame hero-showcase__frame--wide" />
          <div className="hero-showcase__frame hero-showcase__frame--card">
            <span>Tenant interest</span>
            <strong>Save homes after sign in and come back to them later.</strong>
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

      <section className="about-showcase page-panel">
        <div className="about-showcase__media">
          <div className="about-showcase__image about-showcase__image--tall" />
          <div className="about-showcase__image about-showcase__image--small" />
          <div className="about-showcase__image about-showcase__image--wide" />
        </div>

        <div className="about-showcase__copy">
          <p className="eyebrow">About Housify</p>
          <h2>One platform for public rental listings and structured property management.</h2>
          <p className="lede">
            Tenants can browse homes, compare rent, and save the places they
            want to follow up on. Landlords can manage listings, tenants,
            complaints, payments, and occupancy history inside the same system.
          </p>
          <div className="stats-band stats-band--light">
            <article>
              <strong>Listings</strong>
              <span>Public homes shown with pricing and property details</span>
            </article>
            <article>
              <strong>Interest</strong>
              <span>Bookmarks begin after sign in</span>
            </article>
            <article>
              <strong>Management</strong>
              <span>Landlords keep control of records and visibility</span>
            </article>
          </div>
          <div className="page-actions">
            <Link className="btn btn-dark" to="/about">
              More about Housify
            </Link>
          </div>
        </div>
      </section>

      <section className="offer-grid">
        <article className="offer-grid__image" />
        <article className="offer-card">
          <span>For tenants</span>
          <h3>Browse open homes</h3>
          <p>See the homes that are publicly available and compare the details before acting.</p>
          <Link to="/listings">Explore listings</Link>
        </article>
        <article className="offer-card offer-card--accent">
          <span>For landlords</span>
          <h3>Control property visibility</h3>
          <p>Keep public listings in front while managing occupancy, records, and access privately.</p>
          <Link to="/login">Sign in</Link>
        </article>
        <article className="offer-card">
          <span>For the full journey</span>
          <h3>Move from listing to tenancy</h3>
          <p>Keep complaints, payments, and history organized after a tenant moves in.</p>
          <Link to="/contact">Talk to us</Link>
        </article>
        <article className="offer-card">
          <span>For follow-up</span>
          <h3>Mark your interest</h3>
          <p>Use bookmarks after sign in to keep track of the homes you may want to rent.</p>
          <Link to="/login">Create account access</Link>
        </article>
      </section>

      <FeaturedProperties />
    </div>
  )
}

export default Home
