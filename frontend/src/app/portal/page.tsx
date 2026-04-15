"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiArrowRight, FiLogOut, FiShield, FiUser } from "react-icons/fi";
import { api } from "../../utils/api";
import Header from "../../components/admin/Header";
import {
  getStoredGoogleUser,
  isAllowedStaffEmail,
  STAFF_PORTAL_OPTIONS,
} from "../../lib/portalAccess";

export default function PortalLandingPage() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const [name, setName] = useState("MITS Staff");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = getStoredGoogleUser();

    if (!token || !user?.email) {
      router.replace("/login");
      return;
    }

    const normalizedEmail = String(user.email).toLowerCase();
    if (!isAllowedStaffEmail(normalizedEmail)) {
      router.replace("/student-dashboard");
      return;
    }

    setName(user.name || "MITS Staff");
    setEmail(normalizedEmail);
    setIsReady(true);
  }, [router]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore logout transport errors; local state still clears below.
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("googleUserInfo");
      localStorage.removeItem("user");
      router.push("/login");
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] text-[#475569] flex items-center justify-center">
        <p className="text-sm">Preparing portal selection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] [font-family:var(--font-inter)] text-[#0F1724]">
      <div className="w-full border-b border-[#D5D4D4] bg-white">
        <Header />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <main className="grid gap-6 lg:grid-cols-[1.18fr_0.82fr] lg:items-start">
          <section className="admin-section-enter rounded-2xl border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-7">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#2DA8E1]">
                <FiShield className="text-[22px]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#94A3B8]">Institutional portal hub</p>
                <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl" style={{ fontFamily: "var(--font-poppins)" }}>
                  Choose your office portal
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#64748B] sm:text-base">
                  Access your workspace with the same MITS session. Pick any portal and continue with role-based tools.
                </p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              {STAFF_PORTAL_OPTIONS.map((portal) => {
                const isGeneralOffice = portal.key === "generalOffice";

                return (
                  <Link
                    key={portal.key}
                    href={portal.href}
                    className="admin-card-enter admin-soft-card rounded-xl border border-black/10 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                  >
                    <div className={`h-1.5 w-24 rounded-full bg-linear-to-r ${portal.accent}`} />
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[20px] font-semibold text-[#0F1724]">{portal.label}</h2>
                        <p className="mt-2 text-sm leading-6 text-[#64748B]">{portal.description}</p>
                      </div>
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF7FD] text-[#2DA8E1]">
                        <FiArrowRight className="text-[16px]" />
                      </span>
                    </div>
                    <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#2DA8E1]">
                      <span>{isGeneralOffice ? "Open dashboard" : "Continue"}</span>
                      <FiArrowRight className="text-[14px]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="admin-section-enter rounded-2xl border border-black/10 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#94A3B8]">Current access</p>

            <div className="mt-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[#64748B]">Signed in as</p>
                  <p className="mt-1 text-xl font-semibold text-[#0F1724]">{name}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E2E8F0] text-[#2DA8E1]">
                  <FiUser className="text-[20px]" />
                </div>
              </div>
              <p className="mt-3 text-sm text-[#64748B] break-all">{email}</p>
            </div>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">Email Domain</p>
                <p className="mt-1 text-sm font-medium text-[#334155]">MITS Institutional Domain</p>
              </div>
              <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#94A3B8]">Available Portals</p>
                <p className="mt-1 text-sm font-medium text-[#334155]">Admission Cell, General Office, HOD, Account Office</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="admin-btn mt-5 inline-flex items-center gap-2 rounded-lg border border-[#FCA5A5] bg-white px-4 py-2 text-sm font-semibold text-[#DC2626] hover:bg-[#FEF2F2]"
            >
              <FiLogOut className="text-[15px]" />
              Logout
            </button>
          </aside>
        </main>
      </div>
    </div>
  );
}
