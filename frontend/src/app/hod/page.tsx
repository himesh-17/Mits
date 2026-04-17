"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiClock } from "react-icons/fi";
import { getStoredGoogleUser, isAllowedStaffEmail } from "../../lib/portalAccess";

export default function HodPortalPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = getStoredGoogleUser();

    if (!token || !user?.email) {
      router.replace("/login");
      return;
    }

    if (!isAllowedStaffEmail(user.email)) {
      router.replace("/student-dashboard");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0F172A] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 rounded-[2rem] border border-white/10 bg-white/8 p-6 backdrop-blur-xl sm:p-8">
        <p className="inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-1 text-xs uppercase tracking-[0.28em] text-white/65">
          HOD Portal
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">This portal shell is ready.</h1>
        <p className="max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
          The portal selector can route here now. You can wire the HOD dashboard content next without changing the login flow.
        </p>

        <div className="flex w-full flex-col gap-3 rounded-3xl border border-white/10 bg-[#111C35] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-white/80">
            <FiClock className="text-[18px]" />
            <span className="text-sm">Dashboard content pending configuration</span>
          </div>
          <Link href="/portal" className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#0F172A]">
            <FiArrowLeft className="text-[16px]" />
            Back to portal selection
          </Link>
        </div>
      </div>
    </div>
  );
}
