type UserProgressProps = {
  name: string;
  progress: number;
  picture?: string;
};

function getProgressColor(progress: number) {
  if (progress < 50) return "bg-red-600";
  if (progress < 80) return "bg-yellow-400";
  return "bg-green-600";
}

<<<<<<< HEAD
export default function UserProgress({ name, progress, picture }: UserProgressProps) {
  const safeProgress = Math.min(100, Math.max(0, isNaN(progress) ? 0 : progress));
=======
function getInitial(name: string) {
  return name?.charAt(0).toUpperCase() || "?";
}

export default function UserProgress({ name, progress }: UserProgressProps) {
  const safeProgress = Math.min(Math.max(progress, 0), 100);
>>>>>>> 34f5774c13b1a94b7fe723523661861673fc4b17

  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Avatar */}
<<<<<<< HEAD
      <div className="w-12 h-12 rounded-full bg-[#2DA8E1] flex items-center justify-center text-white font-semibold text-lg overflow-hidden flex-shrink-0">
        {picture ? (
          <img src={picture} alt={name} className="w-full h-full object-cover" />
        ) : (
          name.charAt(0)
        )}
=======
      <div className="w-12 h-12 rounded-full bg-[#2DA8E1] flex items-center justify-center text-white font-semibold text-lg">
        {getInitial(name)}
>>>>>>> 34f5774c13b1a94b7fe723523661861673fc4b17
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
