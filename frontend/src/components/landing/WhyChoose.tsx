export default function WhyChoose() {
  return (
    <section className="relative bg-white pt-16 pb-0 ">
      {/* Floating White Card */}
      <div
        className="absolute -top-16 left-[30%] -translate-x-1/2
                   w-[85%] md:w-[55%] lg:w-[30%]
                   bg-white rounded-2xl shadow-xl
                   py-6 px-8 text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-sky-600">
          Why Choose MITS?
        </h2>
      </div>

      <div className="h-8"></div>
    </section>
  );
}
