"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import Image from "next/image";
type Props = {
  name: string;
};

export default function Sidebar({ name }: Props) {
    const router = useRouter();
      const [showLogoutModal, setShowLogoutModal] = useState(false);


  return (
    <div className="w-84 h-screen bg-white border-r border-gray-400 p-6 flex flex-col justify-between ">
      <div>
        <div className="p-0 pb-5 flex items-center gap-4 border-b border-gray-300">
          <Image src="/mits.png" alt="MITS Logo" width={80} height={80} />

          <h2 className="text-[#2DA8E1] font-semibold text-2xl">
            Admission Portal
          </h2>
          
        </div>
        <div className="mt-7 space-y-3">
          <button
            onClick={() => router.push("/student-dashboard")}
            className="w-full text-left bg-[#2DA8E1] text-white px-4 py-2 rounded-md"
          >
            Dashboard
          </button>

          <button
            onClick={() => router.push("/admission")}
            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Application Form
          </button>

          <button
            onClick={() => router.push("/admission/payment")}
            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Payments
          </button>

          <button
            onClick={() => router.push("/admission")}
            className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Status Tracker
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-300">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#2DA8E1] text-white rounded-full flex items-center justify-center font-semibold">
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <p className="font-semibold text-sm">Manas Kukreja</p>
            <p className="text-xs text-gray-500">Student Portal</p>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-2 py-1 rounded-md text-sm font-medium transition"
          >
            <LogOut size={16} />
            Logout
          </button>
          {showLogoutModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
              <div className="bg-white rounded-lg shadow-lg w-80 p-6">
                <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>

                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to logout?
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-4 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={() => router.push("/login")}
                    className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
