function iconProps(className) {
  return {
    "aria-hidden": "true",
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.8",
    viewBox: "0 0 24 24",
  }
}

export function MailIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

export function PhoneIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6.7 4.8a2 2 0 0 1 2.2-.4l1.6.6a2 2 0 0 1 1.2 1.6l.2 1.8a2 2 0 0 1-.6 1.7l-1 1a14 14 0 0 0 3.7 3.7l1-1a2 2 0 0 1 1.7-.6l1.8.2a2 2 0 0 1 1.6 1.2l.6 1.6a2 2 0 0 1-.4 2.2l-1 1.2a3 3 0 0 1-3 1c-6.4-1.4-11.5-6.5-12.9-12.9a3 3 0 0 1 1-3Z" />
    </svg>
  )
}

export function PinIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  )
}

export function BedIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 11h16v6H4z" />
      <path d="M6 11V8.8A1.8 1.8 0 0 1 7.8 7H10a2 2 0 0 1 2 2v2" />
      <path d="M12 11V9.6A1.6 1.6 0 0 1 13.6 8H17a2 2 0 0 1 2 2v1" />
      <path d="M4 17v2" />
      <path d="M20 17v2" />
    </svg>
  )
}

export function BathIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M6 13h12a0 0 0 0 1 0 0v1a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4v-1a0 0 0 0 1 0 0Z" />
      <path d="M6 13V8.5A2.5 2.5 0 0 1 8.5 6H10" />
      <path d="M10 6a1.5 1.5 0 1 1 1.5 1.5" />
      <path d="M4 13h16" />
    </svg>
  )
}

export function CarIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5.5 15.5 7 10.8A2 2 0 0 1 8.9 9.5h6.2a2 2 0 0 1 1.9 1.3l1.5 4.7" />
      <path d="M4.5 15.5h15a1 1 0 0 1 1 1v2h-2v-1h-12v1h-2v-2a1 1 0 0 1 1-1Z" />
      <circle cx="7.5" cy="15.5" r="1.2" />
      <circle cx="16.5" cy="15.5" r="1.2" />
    </svg>
  )
}

export function CalendarIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 6.5h14a1 1 0 0 1 1 1v10A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-10a1 1 0 0 1 1-1Z" />
      <path d="M8 4.5v4" />
      <path d="M16 4.5v4" />
      <path d="M4 9.5h16" />
    </svg>
  )
}

export function WalletIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5.5 7h13a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 18.5 17h-13A1.5 1.5 0 0 1 4 15.5v-7A1.5 1.5 0 0 1 5.5 7Z" />
      <path d="M16 12h4" />
      <path d="M6.5 7V6a1 1 0 0 1 1-1H18" />
      <circle cx="15.5" cy="12" r="0.8" />
    </svg>
  )
}

export function FilterIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 7h16" />
      <path d="M7 12h10" />
      <path d="M10 17h4" />
    </svg>
  )
}

export function SearchIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m16 16 3.5 3.5" />
    </svg>
  )
}

export function GlobeIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4.5 9.5h15" />
      <path d="M4.5 14.5h15" />
      <path d="M12 4a12 12 0 0 1 0 16" />
      <path d="M12 4a12 12 0 0 0 0 16" />
    </svg>
  )
}

export function HeartIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M12 20s-6.5-4.5-8.5-8.4A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.5 5.6C18.5 15.5 12 20 12 20Z" />
    </svg>
  )
}

export function ArrowRightIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  )
}

export function MenuIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  )
}

export function CloseIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

export function ChevronLeftIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m15 6-6 6 6 6" />
    </svg>
  )
}

export function ChevronRightIcon({ className = "ui-icon" }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}
