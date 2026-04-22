import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import { BellIcon, CloseIcon, MenuIcon, SearchIcon } from "../common/Icons"
import { getDashboardSearchItems } from "./dashboardNavigation"

const roleLabelMap = {
  admin: "Platform administration",
  agent: "Agent workspace",
  landlord: "Landlord workspace",
  tenant: "Tenant workspace",
}

function DashboardHeader({ isSidebarOpen = false, onToggleSidebar }) {
  const { signOut, user } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const initials = (user?.full_name || user?.email || "HU")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
  const searchItems = useMemo(() => getDashboardSearchItems(user?.role), [user?.role])
  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = useMemo(() => {
    if (!normalizedQuery) {
      return searchItems.slice(0, 6)
    }

    return searchItems
      .filter((item) => item.matchText.includes(normalizedQuery))
      .slice(0, 6)
  }, [normalizedQuery, searchItems])

  async function handleSignOut() {
    await signOut()
    toast.success("You have been signed out.")
  }

  function openResult(item) {
    navigate(item.to)
    setQuery("")
    setIsSearchFocused(false)
  }

  function handleSearchSubmit(event) {
    event.preventDefault()

    if (!searchResults.length) {
      toast.error("No dashboard matches were found for that search.")
      return
    }

    openResult(searchResults[0])
  }

  return (
    <header className="dashboard-header border-bottom">
      <div className="container-fluid">
        <div className="dashboard-header__inner">
          <div className="dashboard-header__leading">
            <button
              aria-label={isSidebarOpen ? "Close navigation menu" : "Open navigation menu"}
              className="dashboard-header__menu-button"
              onClick={onToggleSidebar}
              type="button"
            >
              {isSidebarOpen ? <CloseIcon className="ui-icon" /> : <MenuIcon className="ui-icon" />}
            </button>
            <form
              className="dashboard-header__search"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsSearchFocused(false)
                }
              }}
              onSubmit={handleSearchSubmit}
            >
              <SearchIcon className="ui-icon ui-icon--muted" />
              <input
                aria-label="Search dashboard"
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search pages, payments, complaints..."
                type="search"
                value={query}
              />
              {isSearchFocused ? (
                <div className="dashboard-search-results">
                  {searchResults.length ? (
                    searchResults.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          className="dashboard-search-results__item"
                          key={item.to}
                          onClick={() => openResult(item)}
                          type="button"
                        >
                          <span className="dashboard-search-results__icon">
                            {Icon ? <Icon className="ui-icon" /> : <SearchIcon className="ui-icon" />}
                          </span>
                          <span className="dashboard-search-results__copy">
                            <strong>{item.label}</strong>
                            <small>{item.section}</small>
                          </span>
                        </button>
                      )
                    })
                  ) : (
                    <div className="dashboard-search-results__empty">
                      No pages match that search.
                    </div>
                  )}
                </div>
              ) : null}
            </form>
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
