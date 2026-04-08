import { Link } from "react-router-dom"

function Logo({ to = "/", subtitle = "Homes, tenants, landlords" }) {
  return (
    <Link className="brand-mark" to={to}>
      <span className="brand-mark__badge" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="brand-mark__text">
        <strong>Housify</strong>
        <small>{subtitle}</small>
      </span>
    </Link>
  )
}

export default Logo
