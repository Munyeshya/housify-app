import { Link } from "react-router-dom"

function NotFoundPage() {
  return (
    <section className="page-panel">
      <p className="eyebrow">404</p>
      <h1>That page does not exist.</h1>
      <p className="lede">
        The page may have moved, or the address may have been entered incorrectly.
      </p>
      <div className="page-actions">
        <Link className="btn btn-dark" to="/">
          Go home
        </Link>
      </div>
    </section>
  )
}

export default NotFoundPage
