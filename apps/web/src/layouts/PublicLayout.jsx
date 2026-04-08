import { Outlet } from "react-router-dom"
import Footer from "../components/layout/Footer"
import Navbar from "../components/layout/Navbar"

function PublicLayout() {
  return (
    <div className="public-shell">
      <Navbar />
      <main className="public-shell__content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

export default PublicLayout
