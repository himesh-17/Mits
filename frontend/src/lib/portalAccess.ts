export const STAFF_ALLOWED_DOMAINS = ["@mitsgwl.ac.in", "@mitsgwalior.ac.in"];

export type PortalKey = "admission" | "generalOffice" | "hod" | "accountOffice";

export interface PortalOption {
  key: PortalKey;
  label: string;
  description: string;
  href: string;
  accent: string;
}

export const STAFF_PORTAL_OPTIONS: PortalOption[] = [
  {
    key: "admission",
    label: "Admission Cell",
    description: "View admission workflows, document checks, and candidate progress.",
    href: "/admission-cell",
    accent: "from-[#0EA5E9] to-[#2563EB]",
  },
  {
    key: "generalOffice",
    label: "General Office",
    description: "Open the General Office dashboard for reports, tracker, and applications.",
    href: "/general-office",
    accent: "from-[#14B8A6] to-[#0F766E]",
  },
  {
    key: "hod",
    label: "HOD",
    description: "Access departmental workflows and leadership views.",
    href: "/hod",
    accent: "from-[#8B5CF6] to-[#4F46E5]",
  },
  {
    key: "accountOffice",
    label: "Account Office",
    description: "Open finance-facing workflows and payment oversight.",
    href: "/account-office",
    accent: "from-[#F97316] to-[#EA580C]",
  },
];

export function normalizeEmail(email: string): string {
  return String(email || "").trim().toLowerCase();
}

export function isAllowedStaffEmail(email: string): boolean {
  const normalizedEmail = normalizeEmail(email);
  return STAFF_ALLOWED_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
}

export function getStoredGoogleUser(): { name?: string; email?: string; picture?: string; role?: string } | null {
  if (typeof window === "undefined") return null;

  const rawValue = localStorage.getItem("googleUserInfo");
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue) as { name?: string; email?: string; picture?: string; role?: string };
  } catch {
    return null;
  }
}

export function getPortalHref(portalKey: PortalKey): string {
  const portal = STAFF_PORTAL_OPTIONS.find((option) => option.key === portalKey);
  return portal?.href || "/portal";
}
