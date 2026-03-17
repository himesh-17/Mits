"use client";

import Image from "next/image";

export default function ProfilePage() {
  const name = "Manas Kukreja";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image src="/mits.png" alt="MITS Logo" width={50} height={50} />

          <h1 className="text-2xl font-semibold text-[#2DA8E1]">
            Admission Portal
          </h1>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto p-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* Avatar + Name */}
          <div className="flex items-center gap-6 border-b pb-6">
            <div className="w-20 h-20 bg-[#2DA8E1] text-white rounded-full flex items-center justify-center text-2xl font-semibold">
              {initials}
            </div>

            <div>
              <h2 className="text-2xl font-semibold">{name}</h2>
              <p className="text-gray-500">Student Applicant</p>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-2 gap-6 mt-8 text-sm">
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
              <p className="font-medium">manaskukreja2910@email.com</p>
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
