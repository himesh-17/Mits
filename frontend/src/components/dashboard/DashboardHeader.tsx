"use client";

import dynamic from "next/dynamic";
import { getInitials } from "../../utils/getInitials";
import { useRouter } from "next/navigation";

const Menu = dynamic(() => import("lucide-react").then((m) => m.Menu));

type Props = {
  name: string;
  toggleSidebar: () => void;
};

export default function DashboardHeader({ name, toggleSidebar }: Props) {
  const router = useRouter();

  const initials = getInitials(name);

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