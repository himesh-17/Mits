"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import PaymentView from "../../components/views/PaymentView";
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

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    setUser({
      name: storedUser?.name || "Student",
      id: "MK-2026-2910",
      progress: 80,
      course: "Btech CSE",
      category: "General",
      email: "manaskukreja2910@email.com",
      phone: "9827437110",
    });
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading dashboard...
      </div>
    );
  }

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

        <div className="flex-1 overflow-y-auto p-8">
          {activeView === "dashboard" && (
            <>
              <Suspense fallback={<div>Loading progress...</div>}>
                <UserProgress name={user.name} progress={user.progress} />
              </Suspense>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
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

          {activeView === "payments" && <PaymentView />}
        </div>
      </div>
    </div>
  );
}
