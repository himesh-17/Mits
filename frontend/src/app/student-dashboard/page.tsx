"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileText, ArrowRight } from "lucide-react";

import Sidebar from "../../components/dashboard/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatusCard from "../../components/dashboard/StatusCard";
import PendingActions from "../../components/dashboard/PendingActions";
import ProfileSummary from "../../components/dashboard/ProfileSummary";
import DeadlinesCard from "../../components/dashboard/DeadlinesCard";
import UserProgress from "../../components/dashboard/user-progress";

interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    async function validateSession() {
      try {
        const token = localStorage.getItem("authToken");
        await axios.get(`${apiBaseUrl}/api/auth/me`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setIsAuthorized(true);

        const saved = localStorage.getItem("googleUserInfo");
        if (saved) {
          setGoogleUser(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Session validation failed:", error);
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    }

    validateSession();
  }, [apiBaseUrl, router]);

  if (isChecking || !isAuthorized) {
    return null;
  }

  const user = {
    name: googleUser?.name || "Student",
    id: "MK-2026-2910",
    progress: 90,
    course: "Btech CSE",
    category: "General",
    email: googleUser?.email || "student@email.com",
    phone: "9827437110",
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar name={user.name} open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col">
        <DashboardHeader
          name={user.name}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <UserProgress name={user.name} progress={user.progress} />

          {/* Start Application Button */}
          <div className="mb-6">
            <Link href="/admission">
              <div className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-[0.99]">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">Start Application Form</h3>
                      <p className="text-white/80 text-sm mt-0.5">Begin or continue your admission application</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-lg text-white font-semibold text-sm group-hover:bg-white/30 transition-colors w-full sm:w-auto justify-center">
                    Open Form
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StatusCard progress={user.progress} id={user.id} />
              <PendingActions />
            </div>

            <div className="space-y-6">
              <ProfileSummary user={user} />
              <DeadlinesCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
