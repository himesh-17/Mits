import Link from "next/link";

import { useRouter } from "next/navigation";
interface Props {
  progress: number;
  id: string;
  nextStepRoute?: string;
}

function getColor(progress: number) {
  if (progress < 50) return "bg-red-600";
  if (progress < 80) return "bg-yellow-400";
  return "bg-green-600";
}

export default function StatusCard({ progress, id, nextStepRoute }: Props) {
  const showDetails = progress > 0;
  const router = useRouter();

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <span
          className={`text-sm px-3 py-1 rounded text-white ${getColor(
            progress,
          )}`}
        >
          CURRENT STATUS
        </span>

        <p className="text-sm text-gray-500 mb-3">
          <b>
            ID: <span className="text-[#2DA8E1] font-medium">MK-2026-2910</span>
          </b>
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-4">
        {progress === 0 ? "Start Your Application" : "Draft"}
      </h2>

      <div className="flex flex-wrap gap-3 mt-4">
        {showDetails && (
          <Link href="/admission/review" className="bg-[#2DA8E1] text-white px-4 py-2 rounded hover:bg-[#2594c7] transition text-center">
            View Details
          </Link>
        )}

        <Link href={nextStepRoute || "/admission"} className="bg-[#2DA8E1] text-white px-4 py-2 rounded hover:bg-[#2594c7] transition text-center">
          {progress === 100 ? "Review Application" : "Complete Your Form"}
        </Link>
      </div>
    </div>
  );
}
