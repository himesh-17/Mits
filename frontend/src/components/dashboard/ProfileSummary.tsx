type User = {
  course: string;
  category: string;
  email: string;
  phone: string;
};

type Props = {
  user: User;
};

export default function ProfileSummary({ user }: Props) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-[#2DA8E1] font-semibold mb-4">PROFILE SUMMARY</h3>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-semibold">Applied Course:</span> {user.course}
        </p>

        <p>
          <span className="font-semibold">Category:</span> {user.category}
        </p>

        <p>
          <span className="font-semibold">Email:</span> {user.email}
        </p>

        <p>
          <span className="font-semibold">Phone:</span> {user.phone}
        </p>
      </div>
    </div>
  );
}
