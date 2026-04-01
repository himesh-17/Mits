"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";
import { api } from "../../utils/api";
import {
  FiHome,
  FiBarChart,
  FiInbox,
  FiLogOut,
} from "react-icons/fi";

type SidebarProps = {
  collapsed?: boolean;
  onNavigate?: () => void;
};

export default function Sidebar({ collapsed = false, onNavigate }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (error) {
      console.error("[AdminSidebar] logout API failed", error);
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("googleUserInfo");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  return (
    <div className="h-full bg-white flex flex-col min-h-0 overflow-x-hidden border-r border-[#E2E8F0]">
      <div className={`flex-1 min-h-0 overflow-y-auto pt-6 pb-6 ${collapsed ? "px-1" : "px-3"}`}>
        {!collapsed && (
          <p className="px-3 mb-4 text-[11px] font-bold tracking-[0.5px] uppercase text-[#94A3B8]">
            Main Menu
          </p>
        )}

        <div className="space-y-1">
          <MenuItem
            href="/admin"
            icon={<FiHome />}
            label="Dashboard"
            active={pathname === "/admin"}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          <MenuItem
            href="/admin/applications"
            icon={<FiInbox />}
            label="All Applications"
            active={pathname?.startsWith("/admin/applications") || false}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
          <MenuItem
            href="/admin/reports"
            icon={<FiBarChart />}
            label="Reports"
            active={pathname === "/admin/reports"}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div className={`border-t border-[#E2E8F0] py-4 shrink-0 ${collapsed ? "px-1" : "px-3"}`}>
        <div className={`flex items-center mb-4 ${collapsed ? "justify-center" : "gap-3 px-3"}`}>
          <div className="h-9 w-9 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-sm font-bold shadow-sm">
            A
          </div>
          {!collapsed && (
            <div>
              <p className="text-[13px] font-bold text-[#0F1724]">Admission Officer</p>
              <p className="text-[11px] text-[#94A3B8]">Admission Cell</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className={`text-[#FF0303] text-[15px] font-bold inline-flex items-center transition-opacity hover:opacity-80 ${collapsed ? "w-full justify-center" : "gap-3 px-3"
            }`}
        >
          <FiLogOut className="text-[18px]" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="w-80 rounded-2xl bg-white p-6 shadow-2xl border border-black/5">
            <h2 className="mb-2 text-lg font-bold text-[#0F1724]">Confirm Logout</h2>
            <p className="mb-6 text-[14px] text-[#64748B] leading-relaxed">
              Are you sure you want to logout from the admission portal?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="rounded-xl bg-[#F1F5F9] px-4 py-2 text-[13px] font-bold text-[#64748B] hover:bg-[#E2E8F0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  void handleLogout();
                }}
                className="rounded-xl bg-[#DC2626] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#B91C1C] transition-colors shadow-lg shadow-red-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  active,
  href,
  collapsed,
  onNavigate,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  href: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={`group flex items-center rounded-xl cursor-pointer transition-all duration-200
        ${active
          ? "bg-[#2DA8E1] text-white shadow-lg shadow-blue-100"
          : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F1724]"
        }
        ${collapsed ? "h-12 w-12 justify-center mx-auto" : "h-11 gap-3 px-3 mx-1"}`}
    >
      <span className={`text-[18px] ${active ? "text-white" : "text-[#94A3B8] group-hover:text-[#2DA8E1]"}`}>
        {icon}
      </span>
      {!collapsed && <span className="text-[14px] font-bold">{label}</span>}
    </Link>
  );
}
