import { Outlet } from "react-router-dom"
import AppHeader from "../components/AppHeader"

function PublicLayout() {
  return (
    <div className="public-shell">
      <AppHeader />
      <main className="public-shell__content">
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
