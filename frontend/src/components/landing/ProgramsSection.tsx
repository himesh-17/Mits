import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export default function ProgramsSection() {
  const programs = [
    {
      title: "B.Tech Programs",
      description:
        "An undergraduate engineering program focused on strong technical foundations and practical skills. Prepares students for industry-ready and innovation-driven careers.",
      duration: "4 Years UG",
      seats: "60–120 Seats",
    },
    {
      title: "M.Tech Programs",
      description:
        "A postgraduate program offering advanced specialization and research-oriented learning. Designed for technical expertise and leadership roles in engineering.",
      duration: "2 Years UG",
      seats: "18–25 per specialization",
    },
    {
      title: "MBA Programs",
      description:
        "A management program developing strategic thinking, leadership, and business skills. Prepares graduates for corporate and entrepreneurial careers.",
      duration: "2 Years UG",
      seats: "60 Seats",
    },
    {
      title: "Ph.D. Programs",
      description:
        "A research-driven doctoral program focused on innovation and academic excellence. Prepares scholars for advanced research and leadership roles.",
      duration: "3–5 Years",
      seats: "Variable",
    },
    {
      title: "MCA Programs",
      description:
        "A professional computing program focused on software development and modern technologies. Builds strong foundations for careers in IT and digital innovation.",
      duration: "2–3 Years UG",
      seats: "60 Seats",
    },
    {
      title: "B.Arch Programs",
      description:
        "A five-year architecture program combining design creativity with technical knowledge. Prepares students for careers in architecture and urban planning.",
      duration: "5 Years UG",
      seats: "40 Seats",
    },
  ];

  return (
    <section className={`bg-gray-100 py-24 ${poppins.className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-5xl font-bold text-sky-600 tracking-wide">
            PROGRAMS OFFERED
          </h2>
          <p className="mt-4 text-gray-600 text-xl">
            Undergraduate, postgraduate, and doctoral programs designed for
            future-ready careers.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {programs.map((program, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-8"
            >
              <h3 className="text-xl font-semibold text-sky-600 mb-4">
                {program.title}
              </h3>

              <p className="text-gray-600 text-l leading-relaxed mb-8">
                {program.description}
              </p>

              <div className="flex justify-between text-sky-600 font-medium text-sm">
                <span>{program.duration}</span>
                <span>{program.seats}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
