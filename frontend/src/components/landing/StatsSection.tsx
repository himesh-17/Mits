"use client";

import { useInView } from "react-intersection-observer";

export default function StatsSection() {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "200px", // load slightly before user reaches it
  });

  return (
    <section ref={ref} className="bg-white py-20">
      {inView && (
        <>
          {/* Section Label */}
          <div className="flex justify-center mb-16">
            <div className="border-2 border-sky-500 text-sky-600 px-6 sm:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-lg font-semibold text-center">
              Excellence that defines your journey
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-6 grid gap-12 lg:grid-cols-2 items-center">
            {/* LEFT SIDE — CIRCLE */}
            <div className="relative flex justify-center items-center">
              <div
                className="
                absolute 
                w-[260px] h-[260px]
                sm:w-[320px] sm:h-[320px]
                lg:w-[440px] lg:h-[440px]
                bg-sky-500 rounded-full
                -translate-x-6 sm:-translate-x-10
              "
              ></div>

              <div
                className="
                relative
                w-[240px] h-[240px]
                sm:w-[300px] sm:h-[300px]
                lg:w-[420px] lg:h-[420px]
                bg-white rounded-full shadow-2xl
                flex flex-col items-center justify-center text-center
              "
              >
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-sky-600">
                  65+
                </h2>

                <p className="mt-3 text-xl sm:text-2xl lg:text-4xl font-semibold text-gray-900">
                  Years <br /> of Experience
                </p>
              </div>
            </div>

            {/* RIGHT SIDE — STATS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 lg:gap-12 lg:pl-20">
              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-600">
                  10K+
                </h3>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  Alumni Network Worldwide
                </p>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-600">
                  25+
                </h3>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  Undergraduate & Postgraduate Programs
                </p>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-600">
                  100+
                </h3>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  Experienced Faculty Members
                </p>
              </div>

              <div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-sky-600">
                  500+
                </h3>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  Annual Campus Placement Offers
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
