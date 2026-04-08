import { Outlet } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import AppSidebar from "../components/AppSidebar"

function AppLayout() {
  return (
    <div className="app-shell">
      <AppHeader />
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
