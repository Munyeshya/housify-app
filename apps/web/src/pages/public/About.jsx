import { Link } from "react-router-dom"

function About() {
  return (
    <div className="public-stack">
      <section className="about-showcase">
        <div className="about-showcase__media">
          <div className="about-showcase__tower" />
          <div className="about-showcase__stack">
            <div className="about-showcase__villa" />
            <div className="about-showcase__house" />
          </div>
          <article className="about-showcase__floating-card">
            <strong>Trusted by growing rental portfolios</strong>
            <div className="about-showcase__avatars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span className="is-count">2K+</span>
            </div>
          </article>
        </div>

        <div className="about-showcase__content">
          <p className="eyebrow">About Housify</p>
          <h1 style={{ fontSize: "clamp(1.46rem, 2.4vw, 2.72rem)" }}>
            A rental platform that connects public discovery with structured property control.
          </h1>
          <p className="lede">
            Housify helps tenants find open homes while giving landlords one place
            to manage listings, occupancy, agents, tenant records, complaints,
            and payment history. It is built for everyday rental decisions and
            long-term property organization.
          </p>

          <div className="about-showcase__metrics">
            <article>
              <strong>10K</strong>
              <span>Listing views tracked</span>
            </article>
            <article>
              <strong>9K</strong>
              <span>Tenant actions organized</span>
            </article>
            <article>
              <strong>98%</strong>
              <span>Operational clarity target</span>
            </article>
          </div>

          <Link className="btn btn-dark" to="/listings">
            See available homes
          </Link>
        </div>
      </section>

      <section className="about-mission">
        <div className="about-mission__heading">
          <p className="eyebrow">Our mission</p>
          <h2>Our Mission & Vision</h2>
        </div>

        <div className="about-mission__layout">
          <article className="about-mission__card">
            <h3>Built to make rental decisions clearer and property operations easier.</h3>
            <p>
              Housify brings together public house discovery, landlord operations,
              tenant history, complaints, payments, and property visibility into one
              connected rental system.
            </p>

            <div className="about-mission__points">
              <section>
                <h4>Our mission</h4>
                <p>
                  Help tenants understand homes before they commit, and give landlords
                  the tools to manage the records, people, and responsibilities tied
                  to every property.
                </p>
              </section>

              <section>
                <h4>Our vision</h4>
                <p>
                  Create a trusted rental platform where listings are easier to compare,
                  tenancy history is better organized, and property management becomes
                  more transparent as portfolios grow.
                </p>
              </section>
            </div>

            <Link className="btn btn-dark about-mission__button" to="/contact">
              Talk to us
            </Link>
          </article>

          <div className="about-mission__image" />
        </div>
      </section>

      <section className="feature-row">
        <article className="feature-card">
          <h2>Open rental discovery</h2>
          <p>
            Public listings show rent, property type, location, and practical facts
            so tenants can compare homes before they act.
          </p>
        </article>
        <article className="feature-card">
          <h2>Tenant follow-up</h2>
          <p>
            Signed-in accounts can bookmark homes, revisit them later, and narrow
            choices without losing track of good options.
          </p>
        </article>
        <article className="feature-card">
          <h2>Landlord control</h2>
          <p>
            Landlords manage visibility, occupation, tenant records, complaints,
            agents, and payment history from one connected workspace.
          </p>
        </article>
      </section>
    </div>
  )
}

export default About
