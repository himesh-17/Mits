"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import Header from "../../components/admin/Header";

export default function AdminLayout({ children }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const user = JSON.parse(storedUser);

    if (!["admin", "super_admin", "administrator"].includes(user.role)) {
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
