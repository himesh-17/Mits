type Deadline = {
  title: string;
  date: string;
};

const deadlines: Deadline[] = [
  {
    title: "Application Form",
    date: "10 Mar",
  },
];

export default function DeadlinesCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h3 className="text-[#2DA8E1] font-semibold mb-4">Upcoming Deadlines</h3>

      <div className="space-y-4">
        {deadlines.map((deadline) => (
          <div key={deadline.title} className="flex items-center gap-3">
            <div className="w-[2px] h-10 bg-red-500" />

            <div>
              <p className="font-medium">{deadline.title}</p>
              <p className="text-red-500 text-sm">{deadline.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
