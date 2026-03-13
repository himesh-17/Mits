type UserProgressProps = {
  name: string;
  progress: number;
};

export default function UserProgress({ name, progress }: UserProgressProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-[#2DA8E1] flex items-center justify-center text-white font-semibold text-lg">
        {name.charAt(0)}
      </div>

      {/* Name + Progress */}
      <div className="flex-1">
        <h2 className="font-semibold text-lg">{name}</h2>

        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">Application Progress</p>

          <span className="text-[#2DA8E1] font-medium text-sm">
            {progress}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-45 h-2 bg-gray-200 rounded-full mt-2">
          <div
            className="h-2 bg-[#2DA8E1] rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
