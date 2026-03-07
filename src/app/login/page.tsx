"use client";

import Image from "next/image";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  return (
    <div className="h-screen w-screen flex overflow-hidden">
      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-sm backdrop-blur-lg bg-white/70 border border-gray-200 shadow-xl rounded-2xl p-10 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/mits.png" alt="MITS Logo" width={140} height={140} />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>

          <p className="text-gray-500 mt-2 mb-8 text-sm">
            <b>MITS Admission Portal</b> for smooth and secure access to your
            application status, updates, and personalized information.
          </p>

          {/* Google Button */}
          <button className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200">
            <FcGoogle size={22} />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-xs text-gray-400">secure login</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          {/* Footer text */}
          <p className="text-xs text-gray-500">
            Use Valid Mail ID used in MPDTE counselling to login. For any
            issues, contact us at {"Manaskukreja2910@gmail.com"}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-sky-500 to-sky-600 items-center justify-center overflow-hidden">
        {/* Bubble Effect */}
        {/* Blob Effects */}
        <div className="absolute w-60 h-60 bg-sky-300/20 rounded-full blur-l top-130 left-[470]"></div>
        <div className="absolute w-60 h-70 bg-sky-300/20 rotate-30 rounded-full blur-l top-90 left-[-40]"></div>

        <div className="absolute w-76 h-76 bg-indigo-300/20  rounded-full blur-l bottom-45 right-[-145]"></div>

        <div className="absolute w-52 h-52 bg-blue-200/20 rounded-full blur-l top-[-80] right-140"></div>
        <div className="absolute w-52 h-72 bg-blue-200/20 rounded-full blur-l top-[-128] right-10"></div>

        {/* Text */}
        <div className="absolute top-15 left-16 text-white z-10">
          <h2 className="text-7xl ml-12 mb-0 font-bold leading-none [text-shadow:3px_2px_6px_rgba(0,0,0,0.4),3px_10px_30px_rgba(0,0,0,0.35)]">
            Welcome to 
          </h2>
          <h2 className="text-7xl ml-12 mt-0 font-semibold leading-none [text-shadow:3px_2px_6px_rgba(0,0,0,0.4),3px_10px_30px_rgba(0,0,0,0.35)]">
            Admission Portal
          </h2>
          <p className="mt-3 text-2xl ml-12 opacity-90">
            Login to access your account
          </p>
        </div>

        {/* Illustration */}
        <div className="relative mt-[40%] ml-7 z-20">
          <Image
            src="/illu3.png"
            alt="Student Illustration"
            width={560}
            height={560}
            priority
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
