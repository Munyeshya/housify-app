import { useEffect } from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../context/AuthContext"

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!isBootstrapping && !isAuthenticated) {
      toast.error("Please sign in to access this area.")
    }
  }, [isAuthenticated, isBootstrapping])

  useEffect(() => {
    if (
      !isBootstrapping &&
      isAuthenticated &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(user?.role)
    ) {
      toast.error("You do not have access to that area.")
    }
  }, [allowedRoles, isAuthenticated, isBootstrapping, user])

  if (isBootstrapping) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate replace to="/unauthorized" />
  }

  return <Outlet />
}

export default ProtectedRoute
