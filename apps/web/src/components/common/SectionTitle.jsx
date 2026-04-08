function SectionTitle({ badge, title, text, action = null }) {
  return (
    <div className="section-title">
      <div>
        {badge ? <p className="eyebrow">{badge}</p> : null}
        <h2>{title}</h2>
        {text ? <p className="lede">{text}</p> : null}
      </div>
      {action ? <div className="section-title__action">{action}</div> : null}
    </div>
  )
}

export default SectionTitle
