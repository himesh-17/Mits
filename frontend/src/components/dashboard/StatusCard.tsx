"use client";
interface Props {
  progress: number;
}
import { useRouter } from "next/navigation";
export default function StatusCard({ progress }: Props) {
  const showDetails = progress > 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="bg-[#F8D10D] text-sm px-3 py-1 rounded">
          CURRENT STATUS
        </span>

        <span className="text-sm text-[#2594c7] ">ID: MK-2026-2910</span>
      </div>

      <h2 className="text-2xl font-semibold mt-4">
        {progress === 0 ? "Start Your Application" : "Draft"}
      </h2>

      <div className="flex gap-3 mt-4">
        {showDetails && (
          <button className="bg-[#2DA8E1] text-white px-4 py-2 rounded">
            View Details
          </button>
        )}

        <button className="bg-[#2DA8E1] text-white px-4 py-2 rounded">
          Complete Your Form
        </button>
      </div>
    </div>
  );
}
