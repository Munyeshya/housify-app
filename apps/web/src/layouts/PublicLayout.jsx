import { Outlet } from "react-router-dom"
import PublicHeader from "../components/PublicHeader"

function PublicLayout() {
  return (
    <div className="public-shell">
      <PublicHeader />
      <main className="public-shell__content">
        <div className="container-fluid">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default PublicLayout
