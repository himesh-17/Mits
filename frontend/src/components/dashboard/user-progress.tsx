type UserProgressProps = {
  name: string;
  progress: number;
};

function getProgressColor(progress: number) {
  if (progress < 50) return "bg-red-600";
  if (progress < 80) return "bg-yellow-400";
  return "bg-green-600";
}

function getInitial(name: string) {
  return name?.charAt(0).toUpperCase() || "?";
}

export default function UserProgress({ name, progress }: UserProgressProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-[#2DA8E1] flex items-center justify-center text-white font-semibold text-lg">
        {getInitial(name)}
      </div>

      {/* Name + Progress */}
      <div className="flex-1">
        <h2 className="font-semibold text-lg">{name}</h2>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">Application Progress</p>

          <span className="text-[#2DA8E1] font-medium text-sm">
            {safeProgress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-2 rounded-full ${getProgressColor(safeProgress)}`}
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
