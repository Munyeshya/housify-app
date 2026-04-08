import { BrowserRouter } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import AppRoutes from "./AppRoutes"

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        gutter={10}
        position="top-right"
        toastOptions={{
          duration: 4500,
          style: {
            border: "1px solid #d6cfbf",
            borderRadius: "10px",
            boxShadow: "0 12px 24px rgba(47, 39, 29, 0.08)",
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
