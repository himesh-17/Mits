type Props = {
  user: {
    course: string;
    category: string;
    email: string;
    phone: string;
  };
};

export default function ProfileSummary({ user }: Props) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="text-[#2DA8E1] font-semibold mb-4">PROFILE SUMMARY</h3>

      <div className="space-y-2 text-sm">
        <p>
          <b>Applied Course</b> {user.course}
        </p>

        <p>
          <b>Category</b> {user.category}
        </p>

        <p>
          <b>Email</b> {user.email}
        </p>

        <p>
          <b>Phone</b> {user.phone}
        </p>
      </div>
    </div>
  );
}
