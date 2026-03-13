export default function MissionVision() {
  return (
    <section className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-sky-600 mb-4">
            Our Mission
          </h2>
          <p className="text-gray-600">
            To provide accurate information, efficient support, and a seamless
            admission experience for students seeking quality education.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-8">
          <h2 className="text-2xl font-semibold text-sky-600 mb-4">
            Our Vision
          </h2>
          <p className="text-gray-600">
            To become a reliable and student-focused platform that simplifies
            the admission process and connects students with opportunities.
          </p>
        </div>
      </div>
    </section>
  );
}
