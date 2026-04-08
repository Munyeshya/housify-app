import { Toaster } from "react-hot-toast"

function ToastProvider() {
  return (
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
  )
}

export default ToastProvider
