import Link from "next/link";

type ActionItemProps = {
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

const actions: ActionItemProps[] = [
  {
    title: "Upload Government Issued ID",
    description: "Aadhar, PAN, Passport required",
    buttonText: "Upload",
    route: "/admission/documents",
  },
  {
    title: "Pay Admission Fee",
    description: "Pay ₹75,000 for seat confirmation",
    buttonText: "Pay now",
    route: "/admission/payment",
  },
  {
    title: "Submit Academic Transcripts",
    description: "10th & 12th marksheets required",
    buttonText: "Upload now",
    route: "/admission/documents",
  },
  {
    title: "Fill Personal Details",
    description: "Complete personal information",
    buttonText: "Fill Form",
    route: "/admission/academic",
  },
];

export default function PendingActions() {
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
