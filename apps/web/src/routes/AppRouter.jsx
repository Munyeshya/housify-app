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
import LandlordTenancies from "../pages/landlord/Tenancies"
import LandlordPayments from "../pages/landlord/Payments"
import LandlordComplaints from "../pages/landlord/Complaints"
import LandlordAgents from "../pages/landlord/Agents"
import LandlordProperties from "../pages/landlord/Properties"
import Bookmarks from "../pages/tenant/Bookmarks"
import Complaints from "../pages/tenant/Complaints"
import TenantDashboard from "../pages/tenant/Dashboard"
import Documents from "../pages/tenant/Documents"
import Payments from "../pages/tenant/Payments"
import Profile from "../pages/tenant/Profile"
import Residence from "../pages/tenant/Residence"
import AgentDashboard from "../pages/agent/Dashboard"
import AgentProperties from "../pages/agent/Properties"
import AgentPayments from "../pages/agent/Payments"
import AgentComplaints from "../pages/agent/Complaints"
import AdminDashboard from "../pages/admin/Dashboard"
import AdminSecurity from "../pages/admin/Security"
import AdminVerification from "../pages/admin/Verification"
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
              <Route element={<LandlordProperties />} path="/landlord/properties" />
              <Route element={<LandlordTenancies />} path="/landlord/tenancies" />
              <Route element={<LandlordPayments />} path="/landlord/payments" />
              <Route element={<LandlordComplaints />} path="/landlord/complaints" />
              <Route element={<LandlordAgents />} path="/landlord/agents" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["tenant"]} />}>
              <Route element={<TenantDashboard />} path="/tenant/dashboard" />
              <Route element={<Residence />} path="/tenant/residence" />
              <Route element={<Payments />} path="/tenant/payments" />
              <Route element={<Bookmarks />} path="/tenant/bookmarks" />
              <Route element={<Complaints />} path="/tenant/complaints" />
              <Route element={<Documents />} path="/tenant/documents" />
              <Route element={<Profile />} path="/tenant/profile" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["agent"]} />}>
              <Route element={<AgentDashboard />} path="/agent/dashboard" />
              <Route element={<AgentProperties />} path="/agent/properties" />
              <Route element={<AgentPayments />} path="/agent/payments" />
              <Route element={<AgentComplaints />} path="/agent/complaints" />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AdminDashboard />} path="/admin/dashboard" />
              <Route element={<AdminSecurity />} path="/admin/security" />
              <Route element={<AdminVerification />} path="/admin/verification" />
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
