import { Outlet } from "react-router-dom"
import AppHeader from "../components/AppHeader"
import PublicFooter from "../components/PublicFooter"

function PublicLayout() {
  return (
    <div className="public-shell">
      <AppHeader />
      <main className="public-shell__content">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

export default PublicLayout
