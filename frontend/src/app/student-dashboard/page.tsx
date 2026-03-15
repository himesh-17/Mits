"use client";

import { useState } from "react";

import Sidebar from "../../components/dashboard/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatusCard from "../../components/dashboard/StatusCard";
import PendingActions from "../../components/dashboard/PendingActions";
import ProfileSummary from "../../components/dashboard/ProfileSummary";
import DeadlinesCard from "../../components/dashboard/DeadlinesCard";
import UserProgress from "../../components/dashboard/user-progress";

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = {
    name: "Manas Kukreja",
    id: "MK-2026-2910",
    progress: 90,
    course: "Btech CSE",
    category: "General",
    email: "manaskukreja2910@email.com",
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

        <div className="flex-1 overflow-y-auto p-8">
          <UserProgress name={user.name} progress={user.progress} />

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
