import { Outlet } from "react-router-dom"
import AppSidebar from "../components/AppSidebar"
import DashboardHeader from "../components/DashboardHeader"

function AppLayout() {
  return (
    <div className="app-shell">
      <DashboardHeader />
      <div className="app-shell__body">
        <AppSidebar />
        <main className="app-shell__content">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppLayout
