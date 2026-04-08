import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { MailIcon, PhoneIcon, PinIcon } from "../common/Icons"
import Logo from "../common/Logo"

const publicLinks = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Listings", to: "/listings" },
  { label: "Contact", to: "/contact" },
]

function Navbar() {
  const { isAuthenticated, user } = useAuth()
  const dashboardPath = user?.role ? `/${user.role}/dashboard` : "/login"

  return (
    <header className="app-header">
      <div className="app-header__top">
        <div className="container-fluid">
          <div className="app-header__top-inner">
            <div className="app-header__contact">
              <span className="app-header__meta-item">
                <MailIcon />
                support@housify.app
              </span>
              <span className="app-header__meta-item">
                <PhoneIcon />
                +250 700 000 000
              </span>
              <span className="app-header__meta-item">
                <PinIcon />
                Kigali, Rwanda
              </span>
            </div>
            <div className="app-header__meta">
              <span>
                {isAuthenticated
                  ? "Account access enabled"
                  : "Sign in to save homes and manage rentals"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="app-header__main border-bottom">
        <div className="container-fluid">
          <div className="app-header__inner">
            <Logo />

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

export default Navbar
