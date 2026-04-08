import { Link } from "react-router-dom"

function NotFound() {
  return (
    <section className="page-panel">
      <p className="eyebrow">404</p>
      <h1>That page does not exist.</h1>
      <p className="lede">
        The route is not mapped yet, or the address was entered incorrectly.
      </p>
      <div className="page-actions">
        <Link className="btn btn-dark" to="/">
          Go home
        </Link>
      </div>
    </section>
  )
}

export default NotFound
