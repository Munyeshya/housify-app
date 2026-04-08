import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Listings", to: "/listings" },
  { label: "Contact", to: "/contact" },
]

function AppHeader() {
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = user?.role ? `/${user.role}/dashboard` : "/login"

  return (
    <header className="app-header">
      <div className="app-header__top">
        <div className="container-fluid">
          <div className="app-header__top-inner">
            <div className="app-header__contact">
              <span>support@housify.app</span>
              <span>+250 700 000 000</span>
            </div>
            <div className="app-header__meta">
              <span>Rental homes, landlord tools, and structured tenancy records.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="app-header__main border-bottom">
        <div className="container-fluid">
          <div className="app-header__inner">
            <NavLink className="brand-mark" to="/">
              <span className="brand-mark__badge">H</span>
              <span className="brand-mark__text">
                <strong>Housify</strong>
                <small>Property listings and rental operations</small>
              </span>
            </NavLink>

            <nav className="app-header__nav" aria-label="Primary">
              {publicLinks.map((link) => (
                <NavLink
                  key={link.to}
                  className={({ isActive }) =>
                    isActive ? "app-header__link is-active" : "app-header__link"
                  }
                  to={link.to}
                >
                  {link.label}
                </NavLink>
              ))}
              <NavLink
                className={({ isActive }) =>
                  isActive ? "app-header__action is-active" : "app-header__action"
                }
                to={isAuthenticated ? dashboardPath : "/login"}
              >
                {isAuthenticated ? "Dashboard" : "Sign in"}
              </NavLink>
            </nav>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
