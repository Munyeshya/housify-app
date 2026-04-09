import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import { BellIcon, SearchIcon } from "../common/Icons"

const roleLabelMap = {
  admin: "Platform administration",
  agent: "Agent workspace",
  landlord: "Landlord workspace",
  tenant: "Tenant workspace",
}

function DashboardHeader() {
  const { signOut, user } = useAuth()
  const initials = (user?.full_name || user?.email || "HU")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  async function handleSignOut() {
    await signOut()
    toast.success("You have been signed out.")
  }

  return (
    <header className="dashboard-header border-bottom">
      <div className="container-fluid">
        <div className="dashboard-header__inner">
          <div className="dashboard-header__search">
            <SearchIcon className="ui-icon ui-icon--muted" />
            <input
              aria-label="Search dashboard"
              placeholder="Search dashboard"
              type="search"
            />
          </div>

          <div className="dashboard-header__actions">
            <button className="dashboard-header__icon-button" type="button">
              <BellIcon className="ui-icon" />
            </button>
            <Link className="dashboard-header__compact-link" to="/listings">
              Listings
            </Link>
            <div className="dashboard-header__user">
              <div className="dashboard-header__user-copy">
                <span>{roleLabelMap[user?.role] || "Housify"}</span>
                <strong>{user?.full_name || user?.email || "Workspace"}</strong>
              </div>
              <div className="dashboard-header__avatar">{initials}</div>
            </div>
            <button className="btn btn-dark dashboard-header__signout" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
