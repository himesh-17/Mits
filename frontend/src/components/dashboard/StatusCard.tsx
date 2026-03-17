"use client";

interface Props {
  progress: number;
  id: string;
}

export default function StatusCard({ progress, id }: Props) {
  const showDetails = progress > 0;

  const getColor = () => {
    if (progress < 50) return "bg-red-600";
    if (progress < 80) return "bg-yellow-400";
    return "bg-green-600";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center">
        <span className={`text-sm px-3 py-1 rounded text-white ${getColor()}`}>
          CURRENT STATUS
        </span>

        <span className="text-sm text-[#2594c7]">ID: {id}</span>
      </div>

      <h2 className="text-2xl font-semibold mt-4">
        {progress === 0 ? "Start Your Application" : "Draft"}
      </h2>

      <div className="flex flex-wrap gap-3 mt-4">
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
