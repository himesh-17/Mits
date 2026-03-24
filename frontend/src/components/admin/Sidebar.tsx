"use client";
import Image from "next/image";

import {
  FiHome,
  FiUsers,
  FiFileText,
  FiUpload,
  FiBarChart2,
} from "react-icons/fi";

export default function Sidebar() {
  return (
    <div className="w-64 h-150 bg-white border-r flex flex-col justify-between">
      {/* Top Section */}
      <div>
        {/* Logo */}
        

        {/* Menu */}
        <div className="mt-4 px-3 text-sm">
          {/* Section */}
          <p className="text-gray-400 px-3 mb-2 text-xs uppercase">
            Admission Office
          </p>

          <MenuItem icon={<FiHome />} label="Dashboard" active />
          <MenuItem icon={<FiUsers />} label="Student Data" />
          <MenuItem icon={<FiUpload />} label="Excel Upload" />

          {/* Section */}
          <p className="text-gray-400 px-3 mt-6 mb-2 text-xs uppercase">
            Management
          </p>

          <MenuItem icon={<FiUsers />} label="Users" />
          <MenuItem icon={<FiBarChart2 />} label="Reports" />
        </div>
      </div>

      {/* Bottom Profile */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
            M
          </div>
          <div>
            <p className="text-sm font-medium">Super Admin</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>

        <button className="mt-4 text-red-500 text-sm flex items-center gap-2">
          ⏻ Logout
        </button>
      </div>
    </div>
  );
}

function MenuItem({ icon, label, active }: any) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer mb-1
        ${active ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
