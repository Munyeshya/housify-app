function Button({
  children,
  className = "",
  type = "button",
  variant = "primary",
  ...props
}) {
  const variants = {
    primary: "ui-button ui-button--primary",
    secondary: "ui-button ui-button--secondary",
    dark: "ui-button ui-button--dark",
    outline: "ui-button ui-button--outline",
  }

  return (
    <button
      className={`${variants[variant] || variants.primary} ${className}`.trim()}
      type={type}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
