import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import { getCurrentUser, login } from "../../services/api"

const roleDashboardMap = {
  admin: "/admin/dashboard",
  agent: "/agent/dashboard",
  landlord: "/landlord/dashboard",
  tenant: "/tenant/dashboard",
}

function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [credentials, setCredentials] = useState({ email: "", password: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(field, value) {
    setCredentials((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      await login(credentials)
      const nextUser = await getCurrentUser()
      setUser(nextUser)
      toast.success("Welcome back.")

      const destination =
        location.state?.from?.pathname ||
        location.state?.from ||
        roleDashboardMap[nextUser?.role] ||
        "/"

      navigate(destination, { replace: true })
    } catch (error) {
      toast.error(error.message || "We could not sign you in.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-panel page-panel--auth auth-page">
      <div className="page-copy auth-page__copy">
        <p className="eyebrow">Sign in</p>
        <h1>Access your Housify account.</h1>
        <p className="lede">
          Sign in to manage your properties, review your saved homes, follow up
          on tenant activity, or return to your account.
        </p>
        <div className="auth-page__highlight">
          <span>Fast access</span>
          <strong>Save homes, review activity, and step back into your rental flow without losing context.</strong>
        </div>
        <div className="page-actions">
          <Link className="btn btn-outline-dark" to="/listings">
            Continue browsing rentals
          </Link>
          <Link className="btn btn-dark" to="/register">
            Create account
          </Link>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            className="form-control"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={credentials.email}
          />
        </label>
        <label>
          Password
          <input
            className="form-control"
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="Password"
            type="password"
            value={credentials.password}
          />
        </label>
        <button className="btn btn-dark" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
        <Link className="auth-form__meta-link" to="/register">
          New to Housify? Create your account
        </Link>
      </form>
    </section>
  )
}

export default Login
