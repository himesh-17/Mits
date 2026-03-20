"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { getInitials } from "../../utils/getInitials";
import { useRouter } from "next/navigation";
const Menu = dynamic(() => import("lucide-react").then((m) => m.Menu));
const Search = dynamic(() => import("lucide-react").then((m) => m.Search));
const Bell = dynamic(() => import("lucide-react").then((m) => m.Bell));

type Props = {
  name: string;
  toggleSidebar: () => void;
};

export default function DashboardHeader({ name, toggleSidebar }: Props) {
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const initials = getInitials(name);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  }, []);

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
    <div className="bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden">
          <Menu size={24} />
        </button>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">
        {/* Search */}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            className="relative p-2 hover:bg-gray-100 rounded-full transition"
          >
            <Bell className="w-5 h-5 text-gray-600" />

            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
          className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:opacity-80 transition"
        >
          {initials}
        </div>
      </div>
    </div>
  );
}
