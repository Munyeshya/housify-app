function SectionTitle({ badge, title, text, center = false, action = null }) {
  return (
    <div className={`section-title${center ? " section-title--center" : ""}`}>
      <div className="section-title__copy">
        {badge ? <p className="eyebrow">{badge}</p> : null}
        <h2>{title}</h2>
        {text ? <p className="lede">{text}</p> : null}
      </div>
      {action ? <div className="section-title__action">{action}</div> : null}
    </div>
  )
}

export default SectionTitle
