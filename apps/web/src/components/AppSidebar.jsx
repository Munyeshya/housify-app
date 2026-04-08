import { NavLink } from "react-router-dom"

const sections = [
  {
    title: "Public",
    items: [{ label: "Browse properties", to: "/" }],
  },
  {
    title: "Roles",
    items: [
      { label: "Landlord workspace", to: "/landlord/dashboard" },
      { label: "Tenant workspace", to: "/tenant/dashboard" },
      { label: "Agent workspace", to: "/agent/dashboard" },
      { label: "Admin workspace", to: "/admin/dashboard" },
    ],
  },
  {
    title: "Account",
    items: [{ label: "Sign in", to: "/login" }],
  },
]

function AppSidebar() {
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

export default AppSidebar
