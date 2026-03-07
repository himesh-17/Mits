"use client";

export default function StatsSection() {
  return (
    <section className="bg-white pt-20 pb-15">
      <div className="flex justify-center mb-16">
        <div className="border-2 border-sky-500 text-sky-600 px-10 py-3 rounded-full text-lg font-semibold">
          Excellence that defines your journey
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center"></div>
      <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* LEFT SIDE — CIRCLE */}
        <div className="relative flex justify-center">
          {/* Blue Background Shape */}
          <div className="absolute w-[440px] h-[440px] bg-sky-500 rounded-full -left-10"></div>

          {/* White Main Circle */}
          <div className="relative w-[420px] h-[420px] bg-white  rounded-full shadow-2xl flex flex-col items-center justify-center text-center">
            <h2 className="text-6xl font-bold text-sky-600">65+</h2>

            <p className="mt-4 text-4xl font-semibold text-gray-900 leading-snug">
              Years <br /> of Experience
            </p>
          </div>
        </div>

        {/* RIGHT SIDE — STATS */}
        <div className="space-y-10 lg:pl-40">
          {" "}
          <div>
            <h3 className="text-5xl font-bold text-sky-600">10K+</h3>
            <p className="text-xl font-semibold text-gray-900">
              Alumni Network Worldwide
            </p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-sky-600">25+</h3>
            <p className="text-xl font-semibold text-gray-900">
              Undergraduate & Postgraduate Programs
            </p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-sky-600">100+</h3>
            <p className="text-xl font-semibold text-gray-900">
              Experienced Faculty Members
            </p>
          </div>
          <div>
            <h3 className="text-5xl font-bold text-sky-600">500+</h3>
            <p className="text-xl font-semibold text-gray-900">
              Annual Campus Placement Offers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
