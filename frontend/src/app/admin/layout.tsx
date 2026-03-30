"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

const ALLOWED_DOMAINS = ["@mitsgwl.ac.in", "@mitsgwalior.ac.in"];

function isAllowedAdminDomain(email = "") {
  const normalizedEmail = String(email).toLowerCase();
  return ALLOWED_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
}

function canAccessAdminFromStorage() {
  if (typeof window === "undefined") return false;

  const storedUser = localStorage.getItem("googleUserInfo");
  const authToken = localStorage.getItem("authToken");

  if (!storedUser || !authToken) {
    return false;
  }

  try {
    const user = JSON.parse(storedUser) as { email?: string };
    const email = String(user?.email || "").toLowerCase();
    return isAllowedAdminDomain(email);
  } catch {
    return false;
  }
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const hasAdminAccess = canAccessAdminFromStorage();

  useEffect(() => {
    if (!hasAdminAccess) {
      router.push("/login");
    }
  }, [hasAdminAccess, router]);

  if (!hasAdminAccess) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Checking access...
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F5F7FA] flex flex-col overflow-hidden">
      <div className="w-full border-b border-[#D5D4D4] bg-white shrink-0">
        <Header
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((prev) => !prev)}
        />
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside
          className={`hidden lg:block relative border-r border-black/10 bg-white shrink-0 transition-all duration-200 ${
            sidebarCollapsed ? "w-18" : "w-92"
          }`}
        >
          <Sidebar collapsed={sidebarCollapsed} />

          <button
            type="button"
            aria-label="Toggle sidebar width"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="hidden lg:inline-flex absolute right-0 top-28 z-20 h-9 w-9 translate-x-1/2 items-center justify-center rounded-full border border-[#CFD7E3] bg-white text-[#475569] shadow-sm"
          >
            {sidebarCollapsed ? (
              <FiChevronRight className="text-[18px]" />
            ) : (
              <FiChevronLeft className="text-[18px]" />
            )}
          </button>
        </aside>

        <div
          className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
            sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/30"
          />

          <aside
            className={`absolute left-0 top-0 h-full w-[min(84vw,320px)] border-r border-[#E2E8F0] bg-white shadow-xl transform transition-transform duration-200 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar collapsed={false} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>

        <main className="admin-page-enter flex-1 min-w-0 overflow-y-auto bg-[#F5F7FA] p-3 sm:p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
