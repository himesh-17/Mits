import Sidebar from "../../components/dashboard/Sidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatusCard from "../../components/dashboard/StatusCard";
import PendingActions from "../../components/dashboard/PendingActions";
import ProfileSummary from "../../components/dashboard/ProfileSummary";
import DeadlinesCard from "../../components/dashboard/DeadlinesCard";
import UserProgress from "../../components/dashboard/user-progress";

export default function StudentDashboard() {
  const name = "Manas Kukreja";
  const progress = 50;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar name={name} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader name={name} />

        <div className="flex-1 overflow-y-auto p-8">
          <UserProgress name={name} progress={progress} />
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <StatusCard progress={progress} />
              <PendingActions />
            </div>

            <div className="space-y-6">
              <ProfileSummary />
              <DeadlinesCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
