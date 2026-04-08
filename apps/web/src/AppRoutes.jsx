import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "./lib/ProtectedRoute"
import AppLayout from "./layouts/AppLayout"
import PublicLayout from "./layouts/PublicLayout"
import {
  About,
  AdminDashboard,
  AgentDashboard,
  Contact,
  Home,
  LandlordDashboard,
  ListingDetail,
  Listings,
  Login,
  NotFound,
  TenantDashboard,
} from "./pages"

function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route element={<Home />} path="/" />
        <Route element={<About />} path="/about" />
        <Route element={<Contact />} path="/contact" />
        <Route element={<Listings />} path="/listings" />
        <Route element={<ListingDetail />} path="/listings/:propertyId" />
        <Route element={<Login />} path="/login" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route element={<LandlordDashboard />} path="/landlord/dashboard" />
          <Route element={<TenantDashboard />} path="/tenant/dashboard" />
          <Route element={<AgentDashboard />} path="/agent/dashboard" />
          <Route element={<AdminDashboard />} path="/admin/dashboard" />
        </Route>
      </Route>

      <Route element={<NotFound />} path="*" />
    </Routes>
  )
}

export default AppRoutes
