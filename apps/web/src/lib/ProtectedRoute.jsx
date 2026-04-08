import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"

function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      toast.error("Please sign in to access this area.")
    }
  }, [isAuthenticated, isBootstrapping])

  if (isBootstrapping) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  return <Outlet />
}

export default ProtectedRoute
