"use client";

import Image from "next/image";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Module-level constant: evaluated once, not on every render (#15)
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

export default function LoginPage() {
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const router = useRouter();


  const handleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      console.error("No credential received");
      return;
    }
    const payload = decodeJwtPayload(credentialResponse.credential);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/auth/google`,
        {
          idToken: credentialResponse.credential
        },
        {
          withCredentials: true
        }
      );

      // Store token for Authorization header
      if (response.data?.data?.token) {
        localStorage.setItem("authToken", response.data.data.token);
      }

      // Decode JWT to extract user info
      if (payload) {
        const userInfo = {
          name: (payload.name as string) || "",
          email: (payload.email as string) || "",
          picture: (payload.picture as string) || "",
        };
        localStorage.setItem("googleUserInfo", JSON.stringify(userInfo));
      }

      console.log("Login Success");
      toast.success("Login successful!");
      const nextRoute = new URLSearchParams(window.location.search).get("next") || "/student-dashboard";
      router.push(nextRoute);

    } catch (error) {
      console.error("Login failed:", error);
      if (axios.isAxiosError(error)) {
        toast.error(`Login failed: ${error.message}. Please check if the server is running at ${apiBaseUrl}`);
      } else {
        toast.error("An unexpected error occurred during login.");
      }
    }
  };

  const triggerGoogleLogin = () => {
    const button = googleButtonRef.current?.querySelector("div[role=button]") as HTMLElement;
    button?.click();
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden">

      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-8 py-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-sm backdrop-blur-lg bg-white/70 border border-gray-200 shadow-xl rounded-2xl p-6 sm:p-10 text-center">

          <div className="flex justify-center mb-6">
            <Image src="/mits.png" alt="MITS Logo" width={140} height={140} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Sign In</h1>

          <p className="text-gray-500 mt-2 mb-8 text-sm">
            <b>MITS Admission Portal</b> for smooth and secure access to your
            application status, updates, and personalized information.
          </p>

          <button
            onClick={triggerGoogleLogin}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-3 bg-white hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-h-[48px] active:scale-[0.98]"
          >
            <FcGoogle size={22} />
            <span className="font-medium text-gray-700">
              Continue with Google
            </span>
          </button>

          <div className="hidden" ref={googleButtonRef}>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => console.log("Google Login Failed")}
            />
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-xs text-gray-400">secure login</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>

          <p className="text-xs text-gray-500">
            Use Valid Mail ID used in MPDTE counselling to login. For any
            issues, contact us at {"Manaskukreja2910@gmail.com"}
          </p>

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-sky-500 to-sky-600 items-center justify-center overflow-hidden">

        <div className="absolute top-15 left-16 text-white z-10">
          <h2 className="text-7xl ml-12 font-bold leading-none">
            Welcome to
          </h2>
          <h2 className="text-7xl ml-12 font-semibold leading-none">
            Admission Portal
          </h2>
          <p className="mt-3 text-2xl ml-12 opacity-90">
            Login to access your account
          </p>
        </div>

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