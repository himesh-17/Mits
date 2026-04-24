"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiHome,
  FiCheckSquare,
  FiFileText,
  FiBarChart2,
  FiUsers,
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
  const router = useRouter();

  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: "/general-office",
      icon: <FiHome className="h-3.5 w-3.5" />,
      section: "navigation",
    },
    {
      label: "Process Tracker",
      href: "/general-office/process-tracker",
      section: "navigation",
      icon: <FiCheckSquare className="h-3.5 w-3.5" />,
    },
    {
      label: "Reports",
      href: "/general-office/reports",
      icon: <FiBarChart2 className="h-3.5 w-3.5" />,
      section: "navigation",
    },
    {
      label: "All Applications",
      href: "/general-office/applications",
      icon: <FiFileText className="h-3.5 w-3.5" />,
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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleUserInfo");
    localStorage.removeItem("admissionFormDraft");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const renderNavSection = (items: NavItem[], title: string) => (
    <div className="mb-6">
      {!collapsed && (
        <h3 className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA4B2]">
          {title}
        </h3>
      )}
      <nav className="space-y-1 px-2">
        {items.map((item) => (
          <Link key={item.href} href={item.href} onClick={onNavigate}>
            <div
              className={`w-full flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${
                isActive(item.href)
                  ? "bg-[#2DA8E1] text-white font-medium"
                  : "text-[#475569] hover:bg-[#F5F7FA] hover:text-[#0F1723]"
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1 text-left text-[12px]">{item.label}</span>
                </>
              )}
            </div>
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
      <div className="flex-1 py-2">
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

          <button
            onClick={handleLogout}
            className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#FF0303] transition-colors hover:opacity-80 cursor-pointer"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}

