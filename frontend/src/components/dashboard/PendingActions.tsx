import Link from "next/link";

export type ActionItemProps = {
  title: string;
  description?: string;
  buttonText: string;
  route: string;
};

function ActionItem({
  title,
  description,
  buttonText,
  route,
}: ActionItemProps) {
  return (
    <div className="flex justify-between items-center py-2">
      <div className="flex items-start gap-2">
        <div className="w-3 h-3 bg-[#2DA8E1] rounded-full mt-2"></div>

        <div>
          <p className="font-medium">{title}</p>

          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
      </div>

      <Link
        href={route}
        className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm transition"
      >
        {buttonText}
      </Link>
    </div>
  );
}

export default function PendingActions({ actions }: { actions: ActionItemProps[] }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#2DA8E1]">
            Pending Actions
          </h3>
          <span className="bg-green-100 text-green-800 px-3 py-1 text-sm rounded">
            All Caught Up!
          </span>
        </div>
        <div className="border-b border-gray-200 my-3"></div>
        <p className="text-gray-500 text-sm mt-4">You have completed all pending tasks for your application.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-8">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-[#2DA8E1]">
          Pending Actions
        </h3>

        <span className="bg-[#FCFBE7] px-3 py-1 text-sm rounded">
          {actions.length} Tasks Remaining
        </span>
      </div>

      <div className="border-b border-gray-200 my-3"></div>

      <div className="space-y-2">
        {actions.map((action) => (
          <ActionItem key={action.title} {...action} />
        ))}
      </div>
    </div>
  );
}
