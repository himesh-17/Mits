"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FileText, ArrowRight } from "lucide-react";

import PaymentView from "../../components/views/PaymentView";
import { useAdmissionForm } from "../../context/AdmissionContext";

// Dynamic imports for improved performance
const Sidebar = dynamic(() => import("../../components/dashboard/Sidebar"));
const DashboardHeader = dynamic(() => import("../../components/dashboard/DashboardHeader"));
const StatusCard = dynamic(() => import("../../components/dashboard/StatusCard"));
const PendingActions = dynamic(
  () => import("../../components/dashboard/PendingActions"),
  { loading: () => <p className="animate-pulse text-gray-400">Loading actions...</p> }
);
const ProfileSummary = dynamic(() => import("../../components/dashboard/ProfileSummary"));
const DeadlinesCard = dynamic(() => import("../../components/dashboard/DeadlinesCard"));
const UserProgress = dynamic(() => import("../../components/dashboard/user-progress"));

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const { googleUser, formData } = useAdmissionForm();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

  useEffect(() => {
    async function validateSession() {
      try {
        const token = localStorage.getItem("authToken");

        await axios.get(`${apiBaseUrl}/api/auth/me`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setIsAuthorized(true);
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

  // Calculate dynamic progress
  let progress = 0;
  if (formData.fullName && formData.email) progress = 25;
  if (formData.programApplied && formData.branch) progress = 50;
  if (formData.docsUploaded && Object.keys(formData.docsUploaded).length > 0) progress = 75;
  if (formData.transactionId) progress = 100;

  const user = {
    name: googleUser?.name || "Student",
    id: "MK-2026-2910",
    progress: progress,
    course: formData.programApplied ? `${formData.programApplied.toUpperCase()} ${formData.branch?.toUpperCase() || ''}` : "Not Selected",
    category: "General",
    email: googleUser?.email || "student@email.com",
    phone: formData.mobile || "Not Provided",
  };

  // Determine Pending Actions & Next Step
  const pendingActions = [];

  const hasPersonalDetails = !!(formData.fullName && formData.email && formData.mobile && formData.address);
  if (!hasPersonalDetails) {
    pendingActions.push({
      title: "Fill Personal Details",
      description: "Complete personal information",
      buttonText: "Fill Form",
      route: "/admission",
    });
  }

  const hasAcademicDetails = !!(formData.programApplied && formData.branch);
  if (!hasAcademicDetails) {
    pendingActions.push({
      title: "Submit Academic Records",
      description: "10th & 12th details, program selection",
      buttonText: "Fill Form",
      route: "/admission/academic",
    });
  }

  const hasDocs = !!(formData.docsUploaded && Object.keys(formData.docsUploaded).length > 0);
  if (!hasDocs) {
    pendingActions.push({
      title: "Upload Required Documents",
      description: "Aadhar, Photo, Marksheets required",
      buttonText: "Upload",
      route: "/admission/documents",
    });
  }

  const hasPaid = !!formData.transactionId;
  if (!hasPaid) {
    pendingActions.push({
      title: "Pay Admission Fee",
      description: "Pay fee for seat confirmation",
      buttonText: "Pay now",
      route: "/admission/payment",
    });
  }

  const nextStepRoute = pendingActions.length > 0 ? pendingActions[0].route : "/admission/review";


  return (
    <div className="flex h-screen border-l bg-gray-50 overflow-hidden">
      <Sidebar
        name={user.name}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Suspense fallback={<div className="p-4 border-b bg-white animate-pulse h-16" />}>
          <DashboardHeader
            name={user.name}
            toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        </Suspense>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeView === "dashboard" && (
            <>
              <UserProgress name={user.name} progress={user.progress} picture={googleUser?.picture} />

              {/* Start Application Button */}
              <div className="mb-6">
                <Link href={nextStepRoute}>
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
                  <StatusCard progress={user.progress} id={user.id} nextStepRoute={nextStepRoute} />
                  <PendingActions actions={pendingActions} />
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