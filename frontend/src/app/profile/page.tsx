"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";


export default function ProfilePage() {
  const name = "Manas Kukreja";
  const router = useRouter();
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      

      <div className="bg-white border-b px-4 sm:px-6 md:px-8 py-4 flex items-center gap-4">

  {/* Back Button */}
  <button
    onClick={() => router.push("/student-dashboard")}
    className="flex items-center gap-2 text-gray-600 hover:text-black"
  >
    <ArrowLeft size={20} />
    Back
  </button>

  {/* Logo */}
  <Image src="/mits.png" alt="MITS Logo" width={40} height={40} />

  {/* Title */}
  <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#2DA8E1]">
    Admission Portal
  </h1>

</div>
      

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Avatar + Name */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b pb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2DA8E1] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-semibold">
              {initials}
            </div>

            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold">{name}</h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Student Applicant
              </p>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 text-sm">
            <div>
              <p className="text-gray-500">Application ID</p>
              <p className="font-medium">MK-2026-2910</p>
            </div>

            <div>
              <p className="text-gray-500">Applied Course</p>
              <p className="font-medium">B.Tech CSE</p>
            </div>

            <div>
              <p className="text-gray-500">Academic Year</p>
              <p className="font-medium">2026–27</p>
            </div>

            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium">General</p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium break-all">
                manaskukreja2910@email.com
              </p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">9827437110</p>
            </div>
          </div>

          {/* Application Progress */}
          <div className="mt-10">
            <h3 className="text-lg font-semibold text-[#2DA8E1] mb-4">
              Application Status
            </h3>

            <div className="space-y-4">
              <StatusStep
                title="Personal Details Submitted"
                status="completed"
              />
              <StatusStep title="Documents Uploaded" status="pending" />
              <StatusStep title="Fee Payment" status="pending" />
              <StatusStep title="Application Review" status="pending" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusStep({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={`w-4 h-4 rounded-full ${
          status === "completed" ? "bg-green-500" : "bg-gray-300"
        }`}
      />

      <p className="text-sm">{title}</p>
    </div>
  );
}
