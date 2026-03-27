"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

const ALLOWED_DOMAIN = "@mitsgwl.ac.in";

export default function AdminLayout({ children }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("googleUserInfo");
    const authToken = localStorage.getItem("authToken");

    if (!storedUser || !authToken) {
      router.push("/login");
      return;
    }

    let user: { email?: string } | null = null;

    try {
      user = JSON.parse(storedUser);
    } catch {
      router.push("/login");
      return;
    }

    const email = String(user?.email || "").toLowerCase();

    if (!email.endsWith(ALLOWED_DOMAIN)) {
      router.push("/login");
      return;
    }

    setLoading(false);
  }, []);

  // 🚨 prevent flicker
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500">
        Checking access...
      </div>
    );
  }

 return (
   <div className="h-screen bg-gray-100 flex flex-col">
     {/* ✅ FULL WIDTH HEADER */}
     <div className="w-full border-b bg-white">
       <Header />
     </div>

     {/* ✅ BELOW HEADER */}
     <div className="flex flex-1 overflow-hidden">
       {/* 🔽 SIDEBAR (reduced width) */}
       <div className="w-56 border-r bg-white">
         <Sidebar />
       </div>

       {/* 🔽 MAIN CONTENT */}
       <main className="flex-1 overflow-y-auto">
         <div className="w-[80%] mx-auto py-6">{children}</div>
       </main>
     </div>
   </div>
 );
}
