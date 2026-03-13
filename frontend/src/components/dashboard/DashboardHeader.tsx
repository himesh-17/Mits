"use client";
import { Bell, Search } from "lucide-react";
import { useRouter } from "next/navigation";
type Props = {
  name: string;
};

export default function DashboardHeader({ name }: Props) {
  const router = useRouter();
  return (
    <div className="w-full bg-white border-b border-gray-400 px-8 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        <span className="text-gray-500 text-sm">Admission 2026–27</span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6 h-10">
        <Search className="w-5 h-5 text-gray-500 cursor-pointer" />

        <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm text-[#2DA8E1] font-medium">MK-2026-2910</p>
            <p className="text-xs text-gray-500">Manas Kukreja</p>
          </div>

          <div
            onClick={() => router.push("/profile")}
            className="w-10 h-10 bg-[#2DA8E1] text-white rounded-full flex items-center justify-center font-semibold cursor-pointer"
          >
            {name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>
      </div>
    </div>
  );
}
