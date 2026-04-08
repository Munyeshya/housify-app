import { AuthProvider } from "./context/AuthContext"
import ToastProvider from "./components/feedback/ToastProvider"
import AppRouter from "./routes/AppRouter"

function App() {
  return (
    <AuthProvider>
      <AppRouter />
      <ToastProvider />
    </AuthProvider>
  )
}

export default App
