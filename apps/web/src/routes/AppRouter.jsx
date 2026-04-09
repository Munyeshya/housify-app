import { BrowserRouter, Route, Routes } from "react-router-dom"
import PublicLayout from "../layouts/PublicLayout"
import DashboardLayout from "../layouts/DashboardLayout"
import ProtectedRoute from "./ProtectedRoute"
import About from "../pages/public/About"
import Contact from "../pages/public/Contact"
import Home from "../pages/public/Home"
import ListingDetail from "../pages/public/ListingDetail"
import Listings from "../pages/public/Listings"
import Login from "../pages/auth/Login"
import Register from "../pages/auth/Register"
import LandlordDashboard from "../pages/landlord/Dashboard"
import TenantDashboard from "../pages/tenant/Dashboard"
import AgentDashboard from "../pages/agent/Dashboard"
import AdminDashboard from "../pages/admin/Dashboard"
import NotFoundPage from "../pages/shared/NotFoundPage"
import UnauthorizedPage from "../pages/shared/UnauthorizedPage"

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route element={<Home />} path="/" />
          <Route element={<About />} path="/about" />
          <Route element={<Contact />} path="/contact" />
          <Route element={<Listings />} path="/listings" />
          <Route element={<ListingDetail />} path="/listings/:propertyId" />
          <Route element={<Login />} path="/login" />
          <Route element={<Register />} path="/register" />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["landlord", "tenant", "agent", "admin"]} />}>
          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute allowedRoles={["landlord"]} />}>
              <Route element={<LandlordDashboard />} path="/landlord/dashboard" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
              <Route element={<TenantDashboard />} path="/tenant/dashboard" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["agent"]} />}>
              <Route element={<AgentDashboard />} path="/agent/dashboard" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AdminDashboard />} path="/admin/dashboard" />
            </Route>
          </Route>
        </Route>

        <Route element={<UnauthorizedPage />} path="/unauthorized" />
        <Route element={<NotFoundPage />} path="*" />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
