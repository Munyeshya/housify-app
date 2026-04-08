function Contact() {
  return (
    <section className="page-panel page-panel--auth contact-page">
      <div className="page-copy">
        <p className="eyebrow">Contact</p>
        <h1>Talk to us about rentals, landlord access, and support.</h1>
        <p className="lede">
          Whether you are searching for a home or managing rental properties,
          our team can help you with onboarding, listings, account access, and
          general platform support.
        </p>
        <div className="contact-card-list">
          <article className="contact-card">
            <strong>Email</strong>
            <span>support@housify.app</span>
          </article>
          <article className="contact-card">
            <strong>Phone</strong>
            <span>+250 700 000 000</span>
          </article>
          <article className="contact-card">
            <strong>Office hours</strong>
            <span>Monday to Friday, 8:00 AM to 6:00 PM</span>
          </article>
        </div>
      </div>

      <form className="auth-form contact-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Full name
          <input className="form-control" placeholder="Your name" type="text" />
        </label>
        <label>
          Email
          <input className="form-control" placeholder="you@example.com" type="email" />
        </label>
        <label>
          Message
          <textarea className="form-control" placeholder="Tell us what you need help with" rows="5" />
        </label>
        <button className="btn btn-dark contact-form__submit" type="submit">
          Send message
        </button>
      </form>
    </section>
  )
}

export default Contact
