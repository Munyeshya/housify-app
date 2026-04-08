function Login() {
  return (
    <section className="page-panel page-panel--auth">
      <div className="page-copy">
        <p className="eyebrow">Authentication</p>
        <h1>Sign in flow placeholder</h1>
        <p className="lede">
          The real form will plug into the Housify auth service layer we already
          built. This page exists now so routing, protection, and layout can be
          structured before visual implementation.
        </p>
      </div>

      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Email
          <input className="form-control" placeholder="name@example.com" type="email" />
        </label>
        <label>
          Password
          <input className="form-control" placeholder="Password" type="password" />
        </label>
        <button className="btn btn-dark" type="submit">
          Sign in
        </button>
      </form>
    </section>
  )
}

export default Login
