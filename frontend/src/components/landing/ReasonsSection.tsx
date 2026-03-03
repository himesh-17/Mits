"use client";

const reasons = [
  {
    number: "01",
    title: "Engineering Excellence Since 1957",
    description:
      "Over six decades of trusted technical education and academic distinction across Central India.",
  },
  {
    number: "02",
    title: "NAAC A++ Accreditation",
    description:
      "Recognized with the highest grade for institutional quality, governance, and academic performance.",
  },
  {
    number: "03",
    title: "Strong Placement Record",
    description:
      "Consistent placements with leading national and multinational recruiters.",
  },
  {
    number: "04",
    title: "Industry-Aligned Curriculum",
    description:
      "Programs designed to meet current and emerging industry demands and technological advancements.",
  },
  {
    number: "05",
    title: "Experienced Faculty",
    description:
      "Highly qualified professors committed to teaching excellence, mentorship, and impactful research.",
  },
  {
    number: "06",
    title: "Advanced Infrastructure",
    description:
      "Modern laboratories, smart classrooms, and well-equipped workshops supporting hands-on learning.",
  },
  {
    number: "07",
    title: "Research & Innovation Focus",
    description:
      "Encouraging innovation through funded research projects and interdisciplinary collaborations.",
  },
  {
    number: "08",
    title: "Student-Centric Support",
    description:
      "Comprehensive mentorship, career guidance, scholarships, and holistic student development.",
  },
  {
    number: "09",
    title: "Vibrant Campus Environment",
    description:
      "Active technical, cultural, and leadership opportunities for overall personal and professional growth.",
  },
];

export default function ReasonsSection() {
  return (
    <section className="bg-gray-100 py-5">
      <div className="mx-auto max-w-7xl px-6">
        {/* Heading */}
        <h2 className="text-center text-3xl md:text-4xl font-bold text-sky-600 mb-16">
          Some Reasons
        </h2>

        {/* Grid */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.number} className="space-y-4">
              {/* Number + Line */}
              <div className="flex items-center gap-4">
                <span className="text-sky-600 font-bold text-xl">
                  {reason.number}
                </span>
                <div className="h-[2px] w-12 bg-sky-500"></div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900">
                {reason.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {reason.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
