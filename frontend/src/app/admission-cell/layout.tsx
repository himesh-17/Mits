"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import AdmissionCellSidebar from "../../components/admission-cell/AdmissionCellSidebar";
import AdmissionCellHeader from "../../components/admission-cell/AdmissionCellHeader";

const ALLOWED_DOMAINS = ["@mitsgwl.ac.in", "@mitsgwalior.ac.in"];

function isAllowedAccess(email = "") {
  const normalizedEmail = String(email).toLowerCase();
  return ALLOWED_DOMAINS.some((domain) => normalizedEmail.endsWith(domain));
}

function hasAdmissionCellAccess() {
  if (typeof window === "undefined") return false;

  const storedUser = localStorage.getItem("googleUserInfo");
  const authToken = localStorage.getItem("authToken");

  if (!storedUser || !authToken) return false;

  try {
    const user = JSON.parse(storedUser) as { email?: string; role?: string };
    const email = String(user?.email || "").toLowerCase();
    const role = String(user?.role || "").toLowerCase();
    const hasRole = ["admissioncell", "administrator"].includes(role);
    return isAllowedAccess(email) && hasRole;
  } catch {
    return false;
  }
}

export default function AdmissionCellLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const canAccess = hasAdmissionCellAccess();

  useEffect(() => {
    if (!canAccess) {
      router.push("/login");
    }
  }, [canAccess, router]);

  if (!canAccess) {
    return (
      <div className="flex h-screen items-center justify-center text-gray-500">
        Checking access...
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#F5F7FA]">
      <div className="w-full shrink-0 border-b border-[#D5D4D4] bg-white">
        <AdmissionCellHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      </div>

      <div
        className={`relative flex min-h-0 flex-1 overflow-hidden lg:grid ${
          sidebarCollapsed
            ? "lg:grid-cols-[4.5rem_minmax(0,1fr)]"
            : "lg:grid-cols-[14rem_minmax(0,1fr)]"
        }`}
      >
        <aside className="relative hidden border-r border-black/10 bg-white lg:block">
          <AdmissionCellSidebar collapsed={sidebarCollapsed} />

          <button
            type="button"
            aria-label="Toggle sidebar width"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            className="absolute right-0 top-20 z-20 hidden h-9 w-9 translate-x-1/2 items-center justify-center rounded-full border border-[#CFD7E3] bg-white text-[#475569] shadow-sm lg:inline-flex"
          >
            {sidebarCollapsed ? (
              <FiChevronRight className="text-[18px]" />
            ) : (
              <FiChevronLeft className="text-[18px]" />
            )}
          </button>
        </aside>

        <div
          className={`fixed inset-0 z-40 transition-opacity duration-200 lg:hidden ${
            sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
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
            <AdmissionCellSidebar
              collapsed={false}
              onNavigate={() => setSidebarOpen(false)}
            />
          </aside>
        </div>

        <main className="min-w-0 overflow-y-auto bg-[#F5F7FA] p-3">{children}</main>
      </div>
    </div>
  );
}
