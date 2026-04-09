import { NavLink } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import {
  AlertIcon,
  BuildingIcon,
  CreditCardIcon,
  GridIcon,
  ShieldIcon,
  UsersIcon,
} from "../common/Icons"

const roleOverviewLinks = {
  admin: [
    { icon: GridIcon, label: "Admin dashboard", to: "/admin/dashboard" },
    { icon: ShieldIcon, label: "Security overview" },
    { icon: UsersIcon, label: "Verification access" },
  ],
  agent: [
    { icon: GridIcon, label: "Agent dashboard", to: "/agent/dashboard" },
    { icon: BuildingIcon, label: "Managed properties" },
    { icon: AlertIcon, label: "Complaints watch" },
  ],
  landlord: [
    { icon: GridIcon, label: "Landlord dashboard", to: "/landlord/dashboard" },
    { icon: BuildingIcon, label: "Portfolio activity" },
    { icon: CreditCardIcon, label: "Rent collection" },
  ],
  tenant: [
    { icon: GridIcon, label: "Tenant dashboard", to: "/tenant/dashboard" },
    { icon: CreditCardIcon, label: "Rent payments" },
    { icon: AlertIcon, label: "Complaint status" },
  ],
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
        { icon: BuildingIcon, label: "All listings", to: "/listings" },
        { icon: UsersIcon, label: "About Housify", to: "/about" },
        { icon: AlertIcon, label: "Contact", to: "/contact" },
      ],
    },
  ]

  return (
    <aside className="app-sidebar">
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
