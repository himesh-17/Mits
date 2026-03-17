"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert("Query submitted successfully!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-xl p-8 space-y-6"
    >
      <div>
        <label className="block text-gray-700 mb-2">Full Name</label>
        <input
          type="text"
          name="name"
          required
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          name="email"
          required
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-2">Your Query</label>
        <textarea
          name="message"
          rows={4}
          required
          onChange={handleChange}
          className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-sky-500 outline-none"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-sky-500 text-white py-3 rounded-lg hover:bg-sky-600 transition"
      >
        Submit Query
      </button>
    </form>
  );
}
