import ContactForm from "../../components/Contact/ContactForm";
import ContactInfo from "../../components/Contact/ContactInfo";

export default function ContactPage() {
  return (
    <section className="min-h-screen bg-gray-50 pt-10 pb-16 px-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
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
