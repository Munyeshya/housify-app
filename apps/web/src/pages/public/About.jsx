function About() {
  return (
    <section className="page-panel">
      <p className="eyebrow">About Housify</p>
      <h1>A rental platform built around clearer property records and better occupancy management.</h1>
      <p className="lede">
        Housify is designed for landlords who need reliable property control
        and for house seekers who want a more transparent rental journey. From
        public listings to tenant records, payments, complaints, and agent
        support, the platform is built to reduce confusion and improve trust on
        both sides.
      </p>
      <div className="content-stack">
        <article className="content-block">
          <h2>For landlords</h2>
          <p>
            Manage multiple properties under one account, control which homes
            are public, track occupancy, review tenant history with permission,
            and work with agents where needed.
          </p>
        </article>
        <article className="content-block">
          <h2>For tenants</h2>
          <p>
            Discover available homes, save the listings that match your needs,
            keep a cleaner payment and residence record, and communicate through
            structured complaint and follow-up channels.
          </p>
        </article>
      </div>
    </section>
  )
}

export default About
