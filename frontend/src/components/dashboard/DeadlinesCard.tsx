export default function DeadlinesCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
      <h3 className="text-[#2DA8E1] font-semibold mb-4">Upcoming Deadlines</h3>

      <div className="flex items-center gap-3">
        <div className="w-0.75 h-10 bg-[#FF0000]"></div>

        <div>
          <p className="font-medium">Application Form</p>
          <p className="text-[#FF0000] text-sm">10 Mar</p>
        </div>
      </div>
    </div>
  );
}
