function Card({ children, className = "" }) {
  return <div className={`ui-card ${className}`.trim()}>{children}</div>
}

export default Card
