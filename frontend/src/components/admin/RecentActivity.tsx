"use client";

import { useEffect, useState } from "react";
import { getAdminData } from "../../lib/AdminStore";

export default function RecentActivity({ refresh }: any) {
  const [data, setData] = useState<any[]>([]);

  // 🔥 Always fetch latest data from store
  useEffect(() => {
    const fetchedData = getAdminData();
    setData(fetchedData);
  }, [refresh]);

  return (
    <div className="bg-white rounded-xl border p-4">
      <div className="flex justify-between mb-4">
        <h2 className="font-semibold">Recent Activity</h2>
        <span className="text-blue-500 text-sm cursor-pointer">View All</span>
      </div>

      <table className="w-full text-sm">
        <thead className="text-gray-400 text-xs uppercase">
          <tr>
            <th className="text-left py-2">App ID</th>
            <th className="text-left">Student Name</th>
            <th className="text-left">Program</th>
            <th className="text-left">Status</th>
            <th className="text-left">Date</th>
            <th className="text-left">Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i} className="border-t hover:bg-gray-50">
              <td className="py-3">{item.id}</td>
              <td className="font-medium">{item.name}</td>
              <td>{item.course}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td className="text-gray-500">{item.date}</td>
              <td>...</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: any) {
  const styles: any = {
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    draft: "bg-gray-200 text-gray-700",
  };

  return (
    <span className={`px-2 py-1 rounded text-xs ${styles[status]}`}>
      {status === "pending"
        ? "Payment Pending"
        : status === "approved"
          ? "Finalized"
          : status === "rejected"
            ? "Rejected"
            : "Draft"}
    </span>
  );
}
