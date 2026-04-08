import { Link } from "react-router-dom"
import FeaturedProperties from "../../components/FeaturedProperties"

function Home() {
  return (
    <div className="public-stack public-stack--wide">
      <section className="home-hero home-hero--fullbleed">
        <div className="page-copy">
          <p className="eyebrow">Find your next rental with confidence</p>
          <h1>See open homes, compare the details, and follow the ones that fit you.</h1>
          <p className="lede">
            Housify brings public rental discovery and real landlord property management
            into one system. Browse available homes, review the facts that matter,
            and save the properties you want to revisit after signing in.
          </p>
          <div className="page-actions">
            <Link className="btn btn-dark" to="/listings">
              Browse listings
            </Link>
            <Link className="btn btn-outline-dark" to="/about">
              About Housify
            </Link>
          </div>
        </div>

        <div className="home-hero__media">
          <div className="home-hero__image home-hero__image--main" />
          <div className="home-hero__card">
            <span>Tenant tools</span>
            <strong>Sign in to bookmark homes and keep track of the places you like.</strong>
          </div>
        </div>
      </section>

      <section className="home-story">
        <div className="home-story__quote">
          <div className="home-story__mark">"</div>
          <h2>Better rental decisions start with clearer property information.</h2>
          <p>
            Tenants should be able to understand a home before they enquire. Landlords
            should be able to manage listings, occupancy, complaints, and payments
            without jumping between disconnected tools.
          </p>
          <div className="home-story__meta">
            <strong>Housify platform</strong>
            <span>Rental discovery and property management</span>
          </div>
        </div>

        <div className="home-story__media">
          <div className="home-story__image" />
        </div>
      </section>

      <section className="home-services">
        <article className="home-service-card home-service-card--media" />
        <article className="home-service-card">
          <span>For tenants</span>
          <h3>Browse open homes</h3>
          <p>
            See currently available houses, apartments, and compounds with pricing,
            location, and practical details before you act.
          </p>
          <Link to="/listings">View homes</Link>
        </article>
        <article className="home-service-card home-service-card--accent">
          <span>For landlords</span>
          <h3>Control your properties</h3>
          <p>
            Manage visibility, tenant occupation, complaints, payment records,
            and agent access from one account.
          </p>
          <Link to="/login">Sign in</Link>
        </article>
        <article className="home-service-card">
          <span>For decisions</span>
          <h3>Keep rental history organized</h3>
          <p>
            Housify keeps tenancy records and history available where the right
            permissions apply.
          </p>
          <Link to="/about">Learn more</Link>
        </article>
        <article className="home-service-card">
          <span>For follow-up</span>
          <h3>Mark your interest</h3>
          <p>
            Tenant accounts can bookmark homes and return to them later when they
            are ready to reach out.
          </p>
          <Link to="/login">Create account access</Link>
        </article>
      </section>

      <section className="home-cta">
        <div>
          <p className="eyebrow">Start with what is available today</p>
          <h2>Explore rental homes that are already open for the public to view.</h2>
          <p className="lede">
            Review pricing, property type, location, and the details a tenant needs
            before choosing where to focus.
          </p>
        </div>
        <div className="page-actions">
          <Link className="btn btn-light" to="/listings">
            View listings
          </Link>
          <Link className="btn btn-outline-light" to="/contact">
            Contact us
          </Link>
        </div>
      </section>

      <FeaturedProperties />
    </div>
  )
}

export default Home
