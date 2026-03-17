"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import ContactForm from "../../components/Contact/ContactForm";
import ContactInfo from "../../components/Contact/ContactInfo";

export default function ContactPage() {
  const router = useRouter();

  return (
    <section className="min-h-screen bg-gray-50 pt-10 pb-16 px-6">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 bg-white/80 backdrop-blur border border-gray-200 px-4 py-2 rounded-full shadow-md hover:bg-sky-600 hover:text-white transition"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="max-w-6xl mx-auto text-center mt-12 mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Contact Admission Cell
        </h1>
        <p className="text-gray-600 mt-3">
          Have questions regarding admissions? Raise a query and our team will
          assist you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <ContactInfo />
        <ContactForm />
      </div>
    </section>
  );
}
