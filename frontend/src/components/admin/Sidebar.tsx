"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import {
  FiHome,
  FiBarChart,
  FiFile,
  FiFileText,
  FiLogOut,
  FiShield,
  FiUpload,
  FiUsers,
} from "react-icons/fi";

type SidebarProps = {
  collapsed?: boolean;
};

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("googleUserInfo");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <div className="h-full bg-white flex flex-col min-h-0 overflow-x-hidden">
      <div className={`flex-1 min-h-0 overflow-y-auto pt-3 pb-6 ${collapsed ? "px-1" : "px-3"}`}>
        {!collapsed ? (
          <p className="px-2.5 mb-2.5 text-[11px] font-bold tracking-[0.4px] uppercase text-[#94A3B8]">
            Admission Office
          </p>
        ) : null}

        <div className="space-y-1">
          <MenuItem
            href="/admin"
            icon={<FiHome className="text-[14px]" />}
            label="Dashboard"
            active={pathname === "/admin"}
            collapsed={collapsed}
          />
          <MenuItem
            href="/admin/student-data"
            icon={<FiFile className="text-[14px]" />}
            label="Student Data"
            active={pathname === "/admin/student-data"}
            collapsed={collapsed}
          />
          <MenuItem
            href="/admin/excel-upload"
            icon={<FiUpload className="text-[14px]" />}
            label="Excel Upload"
            active={pathname === "/admin/excel-upload"}
            collapsed={collapsed}
          />
        </div>

        {!collapsed ? (
          <p className="px-2.5 mt-5 mb-2.5 text-[11px] font-bold tracking-[0.4px] uppercase text-[#94A3B8]">
            Management
          </p>
        ) : null}

        <div className="space-y-1">
          <MenuItem
            href="/admin/users"
            icon={<FiUsers className="text-[14px]" />}
            label="Users"
            active={pathname === "/admin/users"}
            collapsed={collapsed}
          />
          <MenuItem
            href="/admin/rounds"
            icon={<FiShield className="text-[14px]" />}
            label="Rounds"
            active={pathname === "/admin/rounds"}
            collapsed={collapsed}
          />
          <MenuItem
            href="/admin/reports"
            icon={<FiBarChart className="text-[14px]" />}
            label="Reports"
            active={pathname === "/admin/reports"}
            collapsed={collapsed}
          />
          <MenuItem
            href="/admin/audit-logs"
            icon={<FiFileText className="text-[14px]" />}
            label="Audit Logs"
            active={pathname === "/admin/audit-logs"}
            collapsed={collapsed}
          />
        </div>
      </div>

      <div className={`border-t border-[#E2E8F0] py-3 shrink-0 ${collapsed ? "px-1" : "px-3"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="h-9 w-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-sm font-semibold">
            S
          </div>
          {!collapsed ? (
            <div>
              <p className="text-[13px] font-semibold text-[#0F1724]">Super Admin</p>
              <p className="text-[11px] text-[#94A3B8]">Admin Panel</p>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`mt-3 text-[#FF0303] text-[16px] leading-none font-medium inline-flex items-center ${
            collapsed ? "w-full justify-center" : "gap-2 px-2.5"
          }`}
        >
          <FiLogOut className="text-[16px]" />
          {!collapsed ? <span className="text-[16px] leading-none">Logout</span> : null}
        </button>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  active,
  href,
  collapsed,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  href: string;
  collapsed?: boolean;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      className={`h-10 flex items-center rounded-md cursor-pointer mb-1
        ${
          active
            ? "bg-[#2DA8E1] text-white"
            : "text-[#384150] hover:bg-[#F8FAFC]"
        }
        ${collapsed ? "justify-center h-12 w-12 rounded-xl mx-auto" : "gap-2.5 px-2.5 py-2"}`}
    >
      <span className="text-base">{icon}</span>
      {!collapsed ? <span className="text-[14px] font-medium">{label}</span> : null}
    </Link>
  );
}
