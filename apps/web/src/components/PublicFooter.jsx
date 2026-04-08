import { Link } from "react-router-dom"

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Listings", to: "/listings" },
  { label: "Contact", to: "/contact" },
  { label: "Sign in", to: "/login" },
]

function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container-fluid">
        <section className="public-footer__cta">
          <div>
            <p className="eyebrow">Find your next rental with Housify</p>
            <h2>Browse available homes and keep track of the ones you care about.</h2>
          </div>
          <Link className="btn btn-dark" to="/listings">
            View listings
          </Link>
        </section>

        <section className="public-footer__grid">
          <article className="public-footer__brand">
            <div className="brand-mark">
              <span className="brand-mark__badge">H</span>
              <span className="brand-mark__text">
                <strong>Housify</strong>
                <small>Property listings and rental operations</small>
              </span>
            </div>
            <p>
              Housify helps tenants discover rental homes and helps landlords
              manage listings, tenants, payments, complaints, and records.
            </p>
          </article>

          <article>
            <h3>Quick links</h3>
            <nav className="public-footer__links" aria-label="Footer navigation">
              {quickLinks.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </article>

          <article>
            <h3>Contact</h3>
            <div className="public-footer__contact">
              <span>support@housify.app</span>
              <span>+250 700 000 000</span>
              <span>Kigali, Rwanda</span>
            </div>
          </article>
        </section>

        <div className="public-footer__bottom">
          <span>© {new Date().getFullYear()} Housify. All rights reserved.</span>
        </div>
      </div>
    </footer>
  )
}

export default PublicFooter
