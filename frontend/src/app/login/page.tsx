"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-5 ">
            <Image src="/mits.png" alt="MITS Logo" width={120} height={120} />
          </div>

          <h1 className="text-3xl font-bold text-black mb-1">Login</h1>
          <p className="text-gray-600 mb-6">Enter your account details</p>

          {/* Role */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700 text-sm">
              Select Your Role
            </label>
            <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
              <option>Student</option>
              <option>Admin</option>
              <option>Accounts</option>
            </select>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="block mb-1 font-medium text-gray-700 text-sm">
              Username
            </label>
            <input
              type="text"
              placeholder="Username"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Password */}
          <div className="mb-2 relative">
            <label className="block mb-1 font-medium text-gray-700 text-sm">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[32px] text-gray-500 text-sm"
            >
              👁
            </button>
          </div>

          <div className="text-right mb-4 text-sm">
            <Link href="#" className="text-gray-600 hover:text-sky-600">
              Forgot password?
            </Link>
          </div>

          <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 rounded-md transition">
            Login
          </button>

          <div className="mt-4 text-center text-gray-600 text-sm">
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="bg-sky-600 text-white px-3 py-1 rounded-md ml-2 hover:bg-sky-700"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-sky-500 to-sky-600 items-center justify-center overflow-hidden">
        {/* BUBBLE EFFECT */}
        <div className="absolute w-80 h-80 bg-white/10 rounded-full blur-2xl top-10 left-20"></div>
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10"></div>
        <div className="absolute w-60 h-60 bg-white/10 rounded-full blur-xl top-1/3 right-1/3"></div>

        {/* Text */}
        <div className="absolute top-20 left-16 text-white z-10">
          <h2 className="text-5xl font-bold leading-tight">
            Welcome to <br /> student portal
          </h2>
          <p className="mt-3 text-base opacity-90">
            Login to access your account
          </p>
        </div>

        {/* Illustration */}
        <div className="relative z-20">
          <Image
            src="/illustration.png"
            alt="Student Illustration"
            width={480}
            height={480}
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
