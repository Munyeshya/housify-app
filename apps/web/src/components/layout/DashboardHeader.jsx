import { Link } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"

function DashboardHeader() {
  const { signOut, user } = useAuth()

  async function handleSignOut() {
    await signOut()
    toast.success("You have been signed out.")
  }

  return (
    <header className="dashboard-header border-bottom">
      <div className="container-fluid">
        <div className="dashboard-header__inner">
          <div>
            <p className="dashboard-header__eyebrow">Housify</p>
            <h2>{user?.full_name || user?.email || "Your workspace"}</h2>
          </div>

          <div className="dashboard-header__actions">
            <Link className="btn btn-outline-dark" to="/listings">
              View listings
            </Link>
            <button className="btn btn-dark" onClick={handleSignOut} type="button">
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader
