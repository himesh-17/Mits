import Image from "next/image";
import { Linkedin } from "lucide-react";

const faculty = {
  name: "Dr. Atul Chauhan",
  role: "Guiding Faculty",
  image: "/team/atulsir.png",
  linkedin: "https://linkedin.com/in/example",
};
const collaborators = [
  {
    name: "Manas Kukreja",
    role: "Frontend Developer",
    image: "/team/Mk.jpg",
    linkedin: "",
  },
  {
    name: "Himesh Badlani",
    role: "Backend Developer",
    image: "/team/badlani.png",
    linkedin: "",
  },
  {
    name: "Varun Pahuja",
    role: "Backend Developer",
    image: "/team/member2.jpg",
    linkedin: "",
  },
  {
    name: "Ojasvi Anand Sharma",
    role: "Frontend Developer",
    image: "/team/member3.jpg",
    linkedin: "",
  },
  {
    name: "Gune Jain",
    role: "UI/UX Designer",
    image: "/team/member4.jpg",
    linkedin: "",
  },

];

type MemberCardProps = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
};

function MemberCard({ name, role, image ,linkedin}: MemberCardProps) {
  return (
    <div className="bg-white/90 backdrop-blur shadow-lg rounded-xl p-6 text-center hover:shadow-2xl hover:-translate-y-1 transition">
      <div className="flex justify-center mb-4">
        <Image
          src={image}
          alt={name}
          width={120}
          height={120}
          className="rounded-full object-cover border-4 border-sky-200"
        />
      </div>

      <h3 className="text-xl font-semibold">{name}</h3>
      <p className="text-sky-600 text-sm mt-1">{role}</p>
      <div className="w-full flex justify-center mt-4">
        <a
          href={linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-sky-600 text-white hover:bg-sky-700 transition"
        >
          <Linkedin size={18} />
        </a>
      </div>
    </div>
  );
}

export default function MeetTheTeam() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-sky-50 via-blue-50 to-white py-12 px-6">
      {/* Branding Header */}
      <div className="flex flex-col items-center mb-5">
        <Image src="/mits.png" alt="MITS Logo" width={90} height={90} />

        <h2 className="text-sky-700 font-semibold text-lg mt-3 tracking-wide">
          Admission Cell
        </h2>
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Meet The Team</h1>

        <p className="text-gray-600 max-w-xl mx-auto">
          The passionate team behind the Admission Cell project working together
          to deliver an impactful digital experience.
        </p>
      </div>

      {/* Collaborators */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center mb-10 text-gray-800">
          Collaborators
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {collaborators.map((member, index) => (
            <MemberCard
              key={index}
              name={member.name}
              role={member.role}
              image={member.image}
               linkedin={member.linkedin}
            />
          ))}
        </div>
      </div>

      {/* Guiding Faculty */}
      <div className="max-w-md mx-auto mt-20">
        <h2 className="text-2xl font-semibold text-center mb-6 text-gray-800">
          Guiding Faculty
        </h2>

        <MemberCard
          name={faculty.name}
          role={faculty.role}
          image={faculty.image}
        linkedin={faculty.linkedin}
        />
      </div>
    </section>
  );
}
