export default function WhatWeDo() {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800">What We Do</h2>
        <p className="text-gray-600 mt-4">
          The Admission Cell provides support and guidance throughout the
          admission journey.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div className="bg-gray-50 p-8 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">Admission Guidance</h3>
          <p className="text-gray-600">
            Helping students understand eligibility, requirements, and
            procedures for admission.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">Query Support</h3>
          <p className="text-gray-600">
            Students can raise queries and receive assistance regarding
            applications and documentation.
          </p>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-3">Application Assistance</h3>
          <p className="text-gray-600">
            Providing guidance on filling forms, uploading documents, and
            completing admission procedures.
          </p>
        </div>
      </div>
    </section>
  );
}
