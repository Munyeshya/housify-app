import { NavLink } from "react-router-dom"

const sections = [
  {
    title: "Overview",
    items: [
      { label: "Landlord dashboard", to: "/landlord/dashboard" },
      { label: "Tenant dashboard", to: "/tenant/dashboard" },
      { label: "Agent dashboard", to: "/agent/dashboard" },
      { label: "Admin dashboard", to: "/admin/dashboard" },
    ],
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
