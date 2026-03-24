"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import * as XLSX from "xlsx";
import { setAdminData, refreshAdminData } from "../../lib/AdminStore";
import { FiRefreshCw, FiPlus, FiUpload } from "react-icons/fi";
import { span } from "framer-motion/client";

const StatCards = dynamic(() => import("../../components/admin/StatCards"), {
  ssr: false,
});
const RecentActivity = dynamic(
  () => import("../../components/admin/RecentActivity"),
  { ssr: false },
);
const Charts = dynamic(() => import("../../components/admin/Charts"), {
  ssr: false,
});

export default function AdminDashboard() {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔁 Refresh
  const handleRefresh = () => {
    setLoading(true);

    setTimeout(() => {
      refreshAdminData();
      setRefresh((prev) => !prev);
      setLoading(false);
    }, 500);
  };

  // 📂 Excel Upload
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt: any) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

      const formatted = jsonData.map((row, index) => ({
        id: row["App ID"] || `#EX${index}`,
        name: row["Student Name"],
        course: row["Program"],
        status: row["Status"]?.toLowerCase(),
        date: new Date(row["Date"]).toISOString(),
      }));

      setAdminData(formatted);
      setRefresh((prev) => !prev);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <span>
      {/* ✅ Main Content */}
      <div className="w-[110%]  p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold">Admission Dashboard</h2>
            <p className="text-sm text-gray-500">
              Review your daily metrics and student data uploads.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              <FiRefreshCw size={14} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            {/* New Round */}
            <button
              onClick={() => {
                refreshAdminData();
                setRefresh((prev) => !prev);
              }}
              className="flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              <FiPlus size={14} />
              New Round
            </button>

            {/* Excel Upload */}
            <label className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-600">
              <FiUpload size={14} />
              Excel Upload
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        {/* Stats */}
        <StatCards refresh={refresh} />

        {/* Table */}
        <RecentActivity refresh={refresh} />

        {/* Charts */}
        <Charts refresh={refresh} />
      </div>
    </span>
  );
}
