"use client";

import { Menu, Search, Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  name: string;
  toggleSidebar: () => void;
};

export default function DashboardHeader({ name, toggleSidebar }: Props) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const router = useRouter();
  const notifRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden">
          <Menu size={24} />
        </button>

        <span className="text-gray-500 text-sm">Admission 2026–27</span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* Search */}
        <div className="hidden md:flex items-center border rounded-md px-3 py-1 gap-2 bg-gray-50">
          <Search className="w-4 h-4 text-gray-500" />

          <input
            type="text"
            placeholder="Search candidate..."
            value={search}
            onChange={handleSearch}
            className="bg-transparent outline-none text-sm w-40"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Bell className="w-5 h-5 text-gray-600" />

            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-64 bg-white border rounded-lg shadow-lg p-3 z-50">
              <p className="text-sm font-semibold mb-2">Notifications</p>

              <div className="space-y-2 text-sm">
                <div className="p-2 hover:bg-gray-50 rounded">
                  📄 Documents uploaded successfully
                </div>

                <div className="p-2 hover:bg-gray-50 rounded">
                  💳 Payment pending
                </div>

                <div className="p-2 hover:bg-gray-50 rounded">
                  ✅ Profile verified
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          onClick={() => router.push("/profile")}
          className="w-10 h-10 rounded-full bg-[#2DA8E1] flex items-center justify-center text-white font-semibold cursor-pointer"
        >
          {name.charAt(0)}
        </div>
      </div>
    </div>
  );
}
