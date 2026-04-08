import { Link } from "react-router-dom"
import Logo from "../common/Logo"

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Listings", to: "/listings" },
  { label: "Contact", to: "/contact" },
  { label: "Sign in", to: "/login" },
]

function Footer() {
  return (
    <footer className="public-footer">
      <div className="container-fluid">
        <section className="public-footer__cta">
          <div>
            <p className="eyebrow">Find your next rental with Housify</p>
            <h2>Explore available homes and follow the ones you want to rent.</h2>
          </div>
          <Link className="btn btn-dark" to="/listings">
            View listings
          </Link>
        </section>

        <section className="public-footer__grid">
          <article className="public-footer__brand">
            <div className="public-footer__brand-mark">
              <Logo />
            </div>
            <p>
              Housify helps tenants discover rental homes while landlords manage
              listings, occupancy, tenant records, complaints, and payment history.
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

export default Footer
