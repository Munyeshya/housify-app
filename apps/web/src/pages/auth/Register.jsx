import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import { useAuth } from "../../context/AuthContext"
import { getCurrentUser, registerLandlord, registerTenant } from "../../services/api"

const roleDashboardMap = {
  admin: "/admin/dashboard",
  agent: "/agent/dashboard",
  landlord: "/landlord/dashboard",
  tenant: "/tenant/dashboard",
}

const roleCopy = {
  landlord: {
    eyebrow: "Landlord account",
    heading: "Create an account to manage homes and listings.",
    body: "Set up your landlord account to publish available homes, manage rental details, and follow tenant activity from one place.",
  },
  tenant: {
    eyebrow: "Tenant account",
    heading: "Create an account to save homes and follow rentals.",
    body: "Set up your tenant account to bookmark homes, follow available rentals, and keep your housing activity in one place.",
  },
}

const initialFormValues = {
  email: "",
  full_name: "",
  phone_number: "",
  password: "",
  confirmPassword: "",
  display_name: "",
}

function Register() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [role, setRole] = useState("tenant")
  const [formValues, setFormValues] = useState(initialFormValues)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentCopy = useMemo(() => roleCopy[role], [role])

  function updateField(field, value) {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (formValues.password !== formValues.confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    try {
      setIsSubmitting(true)

      if (role === "landlord") {
        await registerLandlord({
          display_name: formValues.display_name,
          email: formValues.email,
          full_name: formValues.full_name,
          password: formValues.password,
          phone_number: formValues.phone_number,
        })
      } else {
        await registerTenant({
          email: formValues.email,
          full_name: formValues.full_name,
          password: formValues.password,
          phone_number: formValues.phone_number,
        })
      }

      const nextUser = await getCurrentUser()
      setUser(nextUser)
      toast.success("Your account is ready.")
      navigate(roleDashboardMap[nextUser?.role] || "/", { replace: true })
    } catch (error) {
      toast.error(error.message || "We could not create your account.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page-panel page-panel--auth">
      <div className="page-copy">
        <p className="eyebrow">{currentCopy.eyebrow}</p>
        <h1>{currentCopy.heading}</h1>
        <p className="lede">{currentCopy.body}</p>

        <div className="register-role-switch">
          <button
            className={`register-role-switch__button${role === "tenant" ? " is-active" : ""}`}
            onClick={() => setRole("tenant")}
            type="button"
          >
            Tenant
          </button>
          <button
            className={`register-role-switch__button${role === "landlord" ? " is-active" : ""}`}
            onClick={() => setRole("landlord")}
            type="button"
          >
            Landlord
          </button>
        </div>

        <div className="page-actions">
          <Link className="btn btn-outline-dark" to="/login">
            Already have an account? Sign in
          </Link>
        </div>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input
            className="form-control"
            onChange={(event) => updateField("full_name", event.target.value)}
            placeholder="Your full name"
            type="text"
            value={formValues.full_name}
          />
        </label>

        {role === "landlord" ? (
          <label>
            Business or display name
            <input
              className="form-control"
              onChange={(event) => updateField("display_name", event.target.value)}
              placeholder="Your business or rental brand name"
              type="text"
              value={formValues.display_name}
            />
          </label>
        ) : null}

        <label>
          Email
          <input
            className="form-control"
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="name@example.com"
            type="email"
            value={formValues.email}
          />
        </label>

        <label>
          Phone number
          <input
            className="form-control"
            onChange={(event) => updateField("phone_number", event.target.value)}
            placeholder="+250 7xx xxx xxx"
            type="tel"
            value={formValues.phone_number}
          />
        </label>

        <label>
          Password
          <input
            className="form-control"
            minLength={8}
            onChange={(event) => updateField("password", event.target.value)}
            placeholder="At least 8 characters"
            type="password"
            value={formValues.password}
          />
        </label>

        <label>
          Confirm password
          <input
            className="form-control"
            minLength={8}
            onChange={(event) => updateField("confirmPassword", event.target.value)}
            placeholder="Repeat your password"
            type="password"
            value={formValues.confirmPassword}
          />
        </label>

        <button className="btn btn-dark" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </section>
  )
}

export default Register
