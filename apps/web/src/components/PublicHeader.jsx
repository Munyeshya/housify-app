import { NavLink } from "react-router-dom"
import { getStoredAuthToken } from "../services/api/storage"

const navItems = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Listings", to: "/listings" },
  { label: "Contact", to: "/contact" },
]

function PublicHeader() {
  const isAuthenticated = Boolean(getStoredAuthToken())

  return (
    <header className="public-header">
      <div className="container-fluid">
        <div className="public-header__inner">
          <NavLink className="brand-mark" to="/">
            <span className="brand-mark__badge">H</span>
            <span className="brand-mark__text">
              <strong>Housify</strong>
              <small>Find and manage rental homes</small>
            </span>
          </NavLink>

          <nav aria-label="Public navigation" className="public-header__nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  isActive ? "public-header__link is-active" : "public-header__link"
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="public-header__actions">
            <NavLink className="btn btn-outline-dark" to="/listings">
              Browse homes
            </NavLink>
            <NavLink className="btn btn-dark" to={isAuthenticated ? "/landlord/dashboard" : "/sign-in"}>
              {isAuthenticated ? "My account" : "Sign in"}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  )
}

export default PublicHeader
