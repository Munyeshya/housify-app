function Contact() {
  return (
    <section className="page-panel page-panel--auth">
      <div className="page-copy">
        <p className="eyebrow">Contact</p>
        <h1>Talk to us about listings, access, and support.</h1>
        <p className="lede">
          Whether you are looking for a home or managing a portfolio, our team
          can help you get started and guide you through the next step.
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

      <form className="auth-form" onSubmit={(event) => event.preventDefault()}>
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
          <textarea className="form-control" placeholder="How can we help?" rows="5" />
        </label>
        <button className="btn btn-dark" type="submit">
          Send message
        </button>
      </form>
    </section>
  )
}

export default Contact
