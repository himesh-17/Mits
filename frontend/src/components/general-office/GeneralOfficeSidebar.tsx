"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiFileText,
  FiBarChart2,
  FiUsers,
  FiChevronRight,
  FiLogOut,
} from "react-icons/fi";

interface GeneralOfficeSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  section: "navigation" | "management";
}

export default function GeneralOfficeSidebar({
  collapsed,
  onNavigate,
}: GeneralOfficeSidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/general-office",
      icon: <FiHome className="w-5 h-5" />,
      section: "navigation",
    },
    {
      label: "Process Tracker",
      href: "/general-office/process-tracker",
      section: "navigation",
      icon: <FiBarChart2 className="w-5 h-5" />,
    },
    {
      label: "Reports",
      href: "/general-office/reports",
      icon: <FiFileText className="w-5 h-5" />,
      section: "navigation",
    },
    {
      label: "All Applications",
      href: "/general-office/applications",
      icon: <FiUsers className="w-5 h-5" />,
      section: "management",
    },
  ];

  const navigationItems = navItems.filter((item) => item.section === "navigation");
  const managementItems = navItems.filter((item) => item.section === "management");

  const isActive = (href: string) => {
    if (href === "/general-office") {
      return pathname === "/general-office" || pathname === "/general-office/dashboard";
    }

    return pathname === href || pathname.startsWith(href + "/");
  };

  const renderNavSection = (items: NavItem[], title: string) => (
    <div className="mb-6">
      {!collapsed && (
        <h3 className="px-4 py-2 text-xs font-semibold text-[#9AA4B2] uppercase tracking-wide">
          {title}
        </h3>
      )}
      <nav className="space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <button
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive(item.href)
                  ? "bg-[#E0F2FE] text-[#2DA8E1] font-medium"
                  : "text-[#475569] hover:bg-[#F5F7FA] hover:text-[#0F1723]"
              }`}
            >
              <span className="relative">
                <span
                  className={`absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-r-full transition-opacity ${
                    isActive(item.href) ? "opacity-100 bg-[#2DA8E1]" : "opacity-0"
                  }`}
                />
              </span>
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-sm">{item.label}</span>
                  {isActive(item.href) && (
                    <FiChevronRight className="w-4 h-4 shrink-0" />
                  )}
                </>
              )}
            </button>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <aside
      className={`h-full bg-white border-r border-[#D5D4D4] overflow-y-auto transition-all duration-300 flex flex-col ${
        collapsed ? "w-16" : "w-52"
      }`}
    >
      <div className="p-3 flex-1">
        {renderNavSection(navigationItems, "Navigation")}
        {renderNavSection(managementItems, "Management")}
      </div>

      {/* Footer Info */}
      {!collapsed && (
        <div className="border-t border-[#D5D4D4] bg-white p-4">
          <div className="flex items-center gap-2 rounded-lg px-1 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F5F9] text-[12px] font-semibold text-[#2563EB]">
              G
            </div>
            <div>
              <p className="text-[13px] font-semibold leading-5 text-[#0F1724]">
                General Office
              </p>
              <p className="text-[12px] leading-4 text-[#94A3B8]">General Office</p>
            </div>
          </div>

          <button className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#FF0303] transition-colors hover:opacity-80">
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}
