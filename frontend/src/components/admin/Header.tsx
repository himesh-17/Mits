"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Header() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return (
    
    <div className="bg-white  px-4 py-2 flex justify-between items-center">
      <div className="flex h-14 items-center gap-4 px-2 py-3 ">
                <div className=" flex mr-0 items-center justify-center">
                  <Image
                                  src="/mits.png"
                                  alt="MITS Logo"
                                  width={55}
                                  height={55}
                                  className="object-contain"
                                />
                </div>
                <span className="font-semibold text-blue-600">Admission Portal</span>
              </div>
  

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500">{user?.name || "Admin"}</span>

        <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
          {user?.name?.[0] || "A"}
        </div>
      </div>
    </div>
  );
}
