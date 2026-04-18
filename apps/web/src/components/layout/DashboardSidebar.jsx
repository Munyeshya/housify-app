import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { getDashboardSections } from "./dashboardNavigation"

function DashboardSidebar({ isOpen = false, onClose }) {
  const { user } = useAuth()
  const sections = getDashboardSections(user?.role)

  return (
    <aside className={isOpen ? "app-sidebar is-open" : "app-sidebar"}>
      <div className="app-sidebar__panel">
        <div className="app-sidebar__brand">
          <span className="app-sidebar__brand-mark">H</span>
          <div>
            <strong>Housify</strong>
            <span>{user?.role || "workspace"}</span>
          </div>
        </div>
        {sections.map((section) => (
          <section className="app-sidebar__section" key={section.title}>
            <h2>{section.title}</h2>
            <nav aria-label={section.title}>
              {section.items.map((item) => {
                const Icon = item.icon

                if (!item.to) {
                  return (
                    <div className="app-sidebar__link app-sidebar__link--static" key={item.label}>
                      {Icon ? <Icon className="ui-icon" /> : null}
                      <span>{item.label}</span>
                    </div>
                  )
                }

                return (
                  <NavLink
                    key={item.to}
                    className={({ isActive }) =>
                      isActive ? "app-sidebar__link is-active" : "app-sidebar__link"
                    }
                    onClick={onClose}
                    to={item.to}
                  >
                    {Icon ? <Icon className="ui-icon" /> : null}
                    <span>{item.label}</span>
                  </NavLink>
                )
              })}
            </nav>
          </section>
        ))}
      </div>
    </aside>
  )
}

export default DashboardSidebar
