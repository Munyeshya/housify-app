import { Link } from "react-router-dom"

function UnauthorizedPage() {
  return (
    <section className="page-panel">
      <p className="eyebrow">Restricted area</p>
      <h1>You do not have access to this page.</h1>
      <p className="lede">
        This part of Housify is only available to accounts with the right role and
        permissions.
      </p>
      <div className="page-actions">
        <Link className="btn btn-dark" to="/">
          Return home
        </Link>
      </div>
    </section>
  )
}

export default UnauthorizedPage
