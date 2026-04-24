"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiGrid, FiLogOut, FiUsers, FiBarChart2 } from "react-icons/fi";

interface HodSidebarProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function HodSidebar({ collapsed, onNavigate }: HodSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { label: "Dashboard", href: "/hod", icon: <FiGrid className="h-3.5 w-3.5" />, exact: true },
    { label: "Finalized Students", href: "/hod/students", icon: <FiUsers className="h-3.5 w-3.5" />, exact: false },
    { label: "Branch Stats", href: "/hod/stats", icon: <FiBarChart2 className="h-3.5 w-3.5" />, exact: false },
  ];

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleUserInfo");
    localStorage.removeItem("admissionFormDraft");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside className={`flex h-full flex-col overflow-y-auto border-r border-[#D5D4D4] bg-white transition-all duration-300 ${collapsed ? "w-16" : "w-56"}`}>
      <div className="flex-1 py-2">
        {!collapsed && <h3 className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9AA4B2]">Main Menu</h3>}
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const active = item.exact
              ? pathname === item.href.split("#")[0]
              : pathname === item.href.split("#")[0] || pathname.startsWith(item.href.split("#")[0] + "/");
            return (
              <Link key={item.label} href={item.href} onClick={onNavigate}>
                <div className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 transition-colors ${active ? "bg-[#2DA8E1] text-white font-medium" : "text-[#475569] hover:bg-[#F5F7FA] hover:text-[#0F1723]"}`}>
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="text-[12px]">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {!collapsed && (
        <div className="border-t border-[#D5D4D4] bg-white p-4">
          <div className="flex items-center gap-2 rounded-lg px-1 py-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F1F5F9] text-[12px] font-semibold text-[#2563EB]">H</div>
            <div>
              <p className="text-[13px] font-semibold leading-5 text-[#0F1724]">Head Of Department</p>
              <p className="text-[12px] leading-4 text-[#94A3B8]">HOD Panel</p>
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
