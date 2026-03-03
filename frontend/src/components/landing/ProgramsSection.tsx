export default function ProgramsSection() {
  const programs = [
    {
      title: "B.Tech Programs",
      desc: "Comprehensive undergraduate engineering programs aligned with industry demands.",
    },
    {
      title: "M.Tech Programs",
      desc: "Advanced postgraduate programs focused on specialization and research.",
    },
    {
      title: "MBA Program",
      desc: "Professional management education integrating business knowledge with exposure.",
    },
    {
      title: "Ph.D Programs",
      desc: "Research-driven doctoral programs fostering innovation.",
    },
    {
      title: "MCA Program",
      desc: "Industry-oriented computing program focused on software development.",
    },
    {
      title: "Emerging Tech Programs",
      desc: "Specialized programs in AI, Data Science, IoT, and modern domains.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-sky-600">PROGRAMS OFFERED</h2>
        <p className="text-gray-500 mt-2">
          Undergraduate, postgraduate, and doctoral programs designed for
          future-ready careers.
        </p>
      </div>

      <div className="grid gap-10 px-10 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program, index) => (
          <div
            key={index}
            className="rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
            <div
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: "url('/program.jpg')" }}
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-sky-600">
                {program.title}
              </h3>
              <p className="mt-3 text-gray-600">{program.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
