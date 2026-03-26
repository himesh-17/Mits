"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdmissionForm } from "../../context/AdmissionContext";

export default function ProfilePage() {
  const router = useRouter();
  const { googleUser, formData } = useAdmissionForm();

  const name = googleUser?.name || "Student";

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const user = {
    name,
    id: "MK-2026-2910",
    course: formData.programApplied
      ? `${formData.programApplied.toUpperCase()} ${formData.branch?.toUpperCase() || ""}`
      : "Not Selected",
    category: "General",
    email: googleUser?.email || "Not Provided",
    phone: formData.mobile || "Not Provided",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b px-4 sm:px-6 md:px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/student-dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-black"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <Image src="/mits.png" alt="MITS Logo" width={40} height={40} />

        <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#2DA8E1]">
          Admission Portal
        </h1>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
          {/* Avatar + Name */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b pb-6">
            {googleUser?.picture ? (
              <Image
                src={googleUser.picture}
                alt="Profile"
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#2DA8E1] text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-semibold">
                {initials}
              </div>
            )}

            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold">{user.name}</h2>
              <p className="text-gray-500 text-sm sm:text-base">
                Student Applicant
              </p>
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 text-sm">
            <div>
              <p className="text-gray-500">Application ID</p>
              <p className="font-medium">{user.id}</p>
            </div>

            <div>
              <p className="text-gray-500">Applied Course</p>
              <p className="font-medium">{user.course}</p>
            </div>

            <div>
              <p className="text-gray-500">Academic Year</p>
              <p className="font-medium">2026–27</p>
            </div>

            <div>
              <p className="text-gray-500">Category</p>
              <p className="font-medium">{user.category}</p>
            </div>

            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium break-all">{user.email}</p>
            </div>

            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{user.phone}</p>
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
                status={
                  formData.fullName && formData.email ? "completed" : "pending"
                }
              />

              <StatusStep
                title="Documents Uploaded"
                status={
                  formData.docsUploaded &&
                  Object.keys(formData.docsUploaded).length > 0
                    ? "completed"
                    : "pending"
                }
              />

              <StatusStep
                title="Fee Payment"
                status={formData.transactionId ? "completed" : "pending"}
              />

              <StatusStep
                title="Application Review"
                status={formData.transactionId ? "completed" : "pending"}
              />
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
