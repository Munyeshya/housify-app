import { Route, Routes } from "react-router-dom"
import ProtectedRoute from "./lib/ProtectedRoute"
import AppLayout from "./layouts/AppLayout"
import {
  AdminDashboard,
  AgentDashboard,
  Home,
  LandlordDashboard,
  Login,
  NotFound,
  TenantDashboard,
} from "./pages"

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<Login />} path="/login" />

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
