import {
  AlertIcon,
  BuildingIcon,
  CreditCardIcon,
  DocumentIcon,
  GridIcon,
  HeartIcon,
  HomeIcon,
  ShieldIcon,
  UserCircleIcon,
  UsersIcon,
} from "../common/Icons"

export const roleOverviewLinks = {
  admin: [
    { icon: GridIcon, keywords: ["admin", "overview", "dashboard"], label: "Admin dashboard", to: "/admin/dashboard" },
    {
      icon: ShieldIcon,
      keywords: ["security", "events", "flags", "users"],
      label: "Security operations",
      to: "/admin/security",
    },
    {
      icon: UsersIcon,
      keywords: ["verification", "documents", "landlord access"],
      label: "Verification access",
      to: "/admin/verification",
    },
  ],
  agent: [
    { icon: GridIcon, keywords: ["agent", "overview", "dashboard"], label: "Agent dashboard", to: "/agent/dashboard" },
    {
      icon: BuildingIcon,
      keywords: ["managed properties", "assigned homes"],
      label: "Managed properties",
      to: "/agent/properties",
    },
    {
      icon: CreditCardIcon,
      keywords: ["managed payments", "payments"],
      label: "Managed payments",
      to: "/agent/payments",
    },
    {
      icon: AlertIcon,
      keywords: ["complaints", "issues"],
      label: "Complaints watch",
      to: "/agent/complaints",
    },
  ],
  landlord: [
    {
      icon: GridIcon,
      keywords: ["landlord", "overview", "dashboard"],
      label: "Landlord dashboard",
      to: "/landlord/dashboard",
    },
    {
      icon: BuildingIcon,
      keywords: ["properties", "photos", "images", "portfolio"],
      label: "Manage properties",
      to: "/landlord/properties",
    },
    {
      icon: HomeIcon,
      keywords: ["tenancies", "assignments", "occupancy"],
      label: "Tenancies",
      to: "/landlord/tenancies",
    },
    {
      icon: CreditCardIcon,
      keywords: ["payments", "rent collection"],
      label: "Rent collection",
      to: "/landlord/payments",
    },
    {
      icon: AlertIcon,
      keywords: ["complaints", "issues"],
      label: "Complaints",
      to: "/landlord/complaints",
    },
    {
      icon: UsersIcon,
      keywords: ["agents", "assignments", "private agent"],
      label: "Agents",
      to: "/landlord/agents",
    },
  ],
  tenant: [
    { icon: GridIcon, keywords: ["tenant", "overview", "dashboard"], label: "Tenant dashboard", to: "/tenant/dashboard" },
    { icon: HomeIcon, keywords: ["home", "residence", "tenancy"], label: "Residence", to: "/tenant/residence" },
    { icon: CreditCardIcon, keywords: ["rent", "payments", "ledger"], label: "Rent payments", to: "/tenant/payments" },
    { icon: HeartIcon, keywords: ["saved", "bookmarks", "shortlist"], label: "Bookmarks", to: "/tenant/bookmarks" },
    { icon: AlertIcon, keywords: ["issues", "complaints", "chat"], label: "Complaints", to: "/tenant/complaints" },
    { icon: DocumentIcon, keywords: ["documents", "legal id", "verification"], label: "Documents", to: "/tenant/documents" },
    { icon: UserCircleIcon, keywords: ["profile", "account", "details"], label: "Profile", to: "/tenant/profile" },
  ],
}

export const exploreLinks = [
  { icon: BuildingIcon, keywords: ["browse", "homes", "listings"], label: "All listings", to: "/listings" },
  { icon: UsersIcon, keywords: ["company", "about", "housify"], label: "About Housify", to: "/about" },
  { icon: AlertIcon, keywords: ["support", "contact", "help"], label: "Contact", to: "/contact" },
]

export function getDashboardSections(role) {
  return [
    {
      title: "Overview",
      items: roleOverviewLinks[role] || [],
    },
    {
      title: "Explore",
      items: exploreLinks,
    },
  ]
}

export function getDashboardSearchItems(role) {
  return getDashboardSections(role)
    .flatMap((section) =>
      section.items
        .filter((item) => item.to)
        .map((item) => ({
          ...item,
          matchText: [item.label, ...(item.keywords || []), section.title].join(" ").toLowerCase(),
          section: section.title,
        })),
    )
}
