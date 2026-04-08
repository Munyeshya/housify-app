import { NavLink } from "react-router-dom"

const quickLinks = [
  { label: "Public listings", to: "/" },
  { label: "Landlord", to: "/landlord/dashboard" },
  { label: "Tenant", to: "/tenant/dashboard" },
  { label: "Admin", to: "/admin/dashboard" },
]

function AppHeader() {
  return (
    <header className="app-header border-bottom">
      <div className="container-fluid">
        <div className="app-header__inner">
          <NavLink className="brand-mark" to="/">
            <span className="brand-mark__badge">H</span>
            <span className="brand-mark__text">
              <strong>Housify</strong>
              <small>Rental management platform</small>
            </span>
          </NavLink>

          <nav className="app-header__nav" aria-label="Primary">
            {quickLinks.map((link) => (
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
          </nav>
        </div>
      </div>
    </header>
  )
}

export default AppHeader
