import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Get in Touch
        </h2>
        <p className="text-gray-600">
          Reach out to the Admission Cell for assistance with applications,
          documents, or any admission related queries.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Mail className="text-sky-500" />
        <span className="text-gray-700">admissions@mits.ac.in</span>
      </div>

      <div className="flex items-center gap-4">
        <Phone className="text-sky-500" />
        <span className="text-gray-700">+91 98765 43210 ,+91 98274 37110</span>
      </div>

      <div className="flex items-center gap-4">
        <MapPin className="text-sky-500" />
        <span className="text-gray-700">
          Admission Cell Office, Main Campus
        </span>
      </div>
    </div>
  );
}
