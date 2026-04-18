import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import DashboardHeader from "../components/layout/DashboardHeader"
import DashboardSidebar from "../components/layout/DashboardSidebar"

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="app-shell">
      <div className={isSidebarOpen ? "app-shell__body app-shell__body--sidebar-open" : "app-shell__body"}>
        <DashboardSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="app-shell__workspace">
          <DashboardHeader
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((current) => !current)}
          />
          <main className="app-shell__content">
            <div className="container-fluid">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {isSidebarOpen ? (
        <button
          aria-label="Close sidebar"
          className="app-shell__backdrop"
          onClick={() => setIsSidebarOpen(false)}
          type="button"
        />
      ) : null}
    </div>
  )
}

export default DashboardLayout
