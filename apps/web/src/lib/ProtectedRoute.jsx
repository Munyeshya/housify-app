import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { getStoredAuthToken } from "../services/api/storage"

function ProtectedRoute() {
  const token = getStoredAuthToken()
  const location = useLocation()

  useEffect(() => {
    if (!token) {
      toast.error("Please sign in to access this area.")
    }
  }, [token])

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}

export default ProtectedRoute
