"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileText, ArrowRight } from "lucide-react";
import PaymentView from "../../components/views/PaymentView";

// Dynamic imports
const Sidebar = dynamic(() => import("../../components/dashboard/Sidebar"));
const DashboardHeader = dynamic(
  () => import("../../components/dashboard/DashboardHeader"),
);
const StatusCard = dynamic(
  () => import("../../components/dashboard/StatusCard"),
);
const PendingActions = dynamic(
  () => import("../../components/dashboard/PendingActions"),
  { loading: () => <p>Loading actions...</p> },
);
const ProfileSummary = dynamic(
  () => import("../../components/dashboard/ProfileSummary"),
);
const DeadlinesCard = dynamic(
  () => import("../../components/dashboard/DeadlinesCard"),
);
const UserProgress = dynamic(
  () => import("../../components/dashboard/user-progress"),
);

interface GoogleUserInfo {
  name: string;
  email: string;
  picture?: string;
}

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

  const [googleUser, setGoogleUser] = useState<GoogleUserInfo | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  const router = useRouter();
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

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

  if (isChecking || !isAuthorized) return null;

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
      <Sidebar
        name={user.name}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="p-4">Loading header...</div>}>
          <DashboardHeader
            name={user.name}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </Suspense>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Dashboard View */}
          {activeView === "dashboard" && (
            <>
              <UserProgress name={user.name} progress={user.progress} />

              {/* Start Application */}
              <div className="mb-6">
                <Link href="/admission">
                  <div className="bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-[0.99]">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">
                            Start Application Form
                          </h3>
                          <p className="text-white/80 text-sm">
                            Begin or continue your admission
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg text-white text-sm">
                        Open Form
                        <ArrowRight className="w-4 h-4" />
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
            </>
          )}

          {/* Payments View */}
          {activeView === "payments" && <PaymentView />}
        </div>
      </div>
    </div>
  );
}