import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"

const roleOverviewLinks = {
  admin: [{ label: "Admin dashboard", to: "/admin/dashboard" }],
  agent: [{ label: "Agent dashboard", to: "/agent/dashboard" }],
  landlord: [{ label: "Landlord dashboard", to: "/landlord/dashboard" }],
  tenant: [{ label: "Tenant dashboard", to: "/tenant/dashboard" }],
}

function DashboardSidebar() {
  const { user } = useAuth()
  const sections = [
    {
      title: "Overview",
      items: roleOverviewLinks[user?.role] || [],
    },
    {
      title: "Explore",
      items: [
        { label: "All listings", to: "/listings" },
        { label: "About Housify", to: "/about" },
        { label: "Contact", to: "/contact" },
      ],
    },
  ]

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__panel">
        {sections.map((section) => (
          <section className="app-sidebar__section" key={section.title}>
            <h2>{section.title}</h2>
            <nav aria-label={section.title}>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) =>
                    isActive ? "app-sidebar__link is-active" : "app-sidebar__link"
                  }
                  to={item.to}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </section>
        ))}
      </div>
    </aside>
  )
}

export default DashboardSidebar
