"use client";

// import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
type Props = {
  name: string;
  open: boolean;
  setOpen: (value: boolean) => void;
  activeView: string;
  setActiveView: (value: string) => void;
};

export default function Sidebar({ name, open, setOpen, activeView, setActiveView }: Props) {
  // const router = useRouter();
  const router = useRouter();
  const pathname = usePathname();

  const navItem = (view: string) =>
    `block w-full text-left px-4 py-2 rounded transition ${activeView === view
      ? "bg-[#2DA8E1] text-white"
      : "hover:bg-gray-100 text-gray-700"
    }`;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 lg:hidden z-40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`
  fixed lg:relative
  bg-white border-r
  h-screen w-72
  transform transition-transform duration-300
  ${open ? "translate-x-0" : "-translate-x-full"}
  lg:translate-x-0
  flex flex-col justify-between
  z-50
  `}
      >
        {/* Top Section */}
        <div className="p-6">
          <div className="p-6 border-b flex items-center gap-3">

            <Image
              src="/mits.png"
              alt="MITS Logo"
              width={80}
              height={80}
              className="object-contain"
            />
            <h2 className="text-xl font-semibold text-[#2DA8E1]">
              Admission Portal
            </h2>
          </div>

          <nav className="mt-6 space-y-3">
            <button
              onClick={() => setActiveView("dashboard")}
              className={navItem("dashboard")}
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/admission")}
              className={navItem("admission")}
            >
              Application Form
            </button>

            <button
              onClick={() => setActiveView("payments")}
              className={navItem("payments")}
            >
              Payments
            </button>

            <button
              onClick={() => router.push("/profile")}
              className={navItem("/profile")}
            >
              Profile
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-300">
          {/* User */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#2DA8E1] text-white rounded-full flex items-center justify-center font-semibold">
              {name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>

            <div>
              <p className="font-semibold text-sm">{name}</p>
              <p className="text-xs text-gray-500">Student Portal</p>
            </div>
          </div>

          {/* Student ID */}
          <p className="text-xs text-gray-500 mb-3">
            ID: <span className="text-[#2DA8E1] font-medium">MK-2026-2910</span>
          </p>

          {/* Logout Button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 text-red-600 border border-red-200 hover:bg-red-50 px-3 py-2 rounded-md text-sm font-medium transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              Confirm Logout
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to logout from the portal?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={() => router.push("/login")}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
