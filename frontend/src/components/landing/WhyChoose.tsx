export default function WhyChoose() {
  return (
    <section className="relative bg-white pt-16 pb-0">
      {/* Floating White Card */}
      <div
        className="
        absolute -top-12
        left-6 sm:left-8 md:left-12 lg:left-24
        w-[75%] sm:w-[55%] md:w-[40%] lg:w-[28%]
        bg-white hover:shadow-2xl transition rounded-2xl shadow-xl
        py-4 px-6  text-center
        "
      >
        <h2 className="text-xl sm:text-2xl font-bold justify text-sky-600">
          Why Choose MITS?
        </h2>
      </div>

      <div className="h-10"></div>
    </section>
  );
}
