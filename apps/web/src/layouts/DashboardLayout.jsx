import { Outlet } from "react-router-dom"
import DashboardHeader from "../components/layout/DashboardHeader"
import DashboardSidebar from "../components/layout/DashboardSidebar"

function DashboardLayout() {
  return (
    <div className="app-shell">
      <DashboardHeader />
      <div className="app-shell__body">
        <DashboardSidebar />
        <main className="app-shell__content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
