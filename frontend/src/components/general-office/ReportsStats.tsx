"use client";

import { useEffect, useState } from "react";
import {
  FiCheck,
  FiClock,
  FiFileText,
  FiTrendingUp,
} from "react-icons/fi";

interface ReportsStatsProps {
  data: {
    totalApplications: number;
    finalized: number;
    awaitingApproval: number;
    revenueCollected: string;
  };
  loading?: boolean;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 800,
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayValue(Math.floor(startValue + diff * progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, displayValue]);

  return <span>{displayValue}</span>;
};

const StatCard: React.FC<{
  title: string;
  value: number | string;
  icon: React.ReactNode;
  valueColor: string;
  iconChipColor: string;
  loading?: boolean;
}> = ({ title, value, icon, valueColor, iconChipColor, loading = false }) => (
  <div
    className="rounded-md border border-[#D5D4D4] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
  >
    <div className="mb-4">
      <div className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${iconChipColor}`}>
        <span className="h-3.5 w-3.5">{icon}</span>
      </div>
    </div>

    <div className={`text-[39px] font-bold leading-none ${valueColor}`} style={{ fontFamily: "var(--font-poppins)" }}>
      {loading ? (
        <span className="text-gray-300">-</span>
      ) : typeof value === "number" ? (
        <AnimatedNumber value={value} />
      ) : (
        value
      )}
    </div>
    <p className="mt-1 text-[13px] text-[#7B7B7B]">{title}</p>
  </div>
);

export default function ReportsStats({
  data,
  loading = false,
}: ReportsStatsProps) {
  const stats = [
    {
      title: "Total Applications",
      value: data.totalApplications,
      icon: <FiFileText className="w-full h-full" />,
      valueColor: "text-[#111827]",
      iconChipColor: "bg-[#DBEAFE] text-[#2DA8E1]",
    },
    {
      title: "Finalized",
      value: data.finalized,
      icon: <FiCheck className="w-full h-full" />,
      valueColor: "text-[#111827]",
      iconChipColor: "bg-[#DCFCE7] text-[#16A34A]",
    },
    {
      title: "Awaiting Approval",
      value: data.awaitingApproval,
      icon: <FiClock className="w-full h-full" />,
      valueColor: "text-[#111827]",
      iconChipColor: "bg-[#FEF3C7] text-[#D97706]",
    },
    {
      title: "Revenue Collected",
      value: data.revenueCollected,
      icon: <FiTrendingUp className="w-full h-full" />,
      valueColor: "text-[#111827]",
      iconChipColor: "bg-[#F3E8FF] text-[#A855F7]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          valueColor={stat.valueColor}
          iconChipColor={stat.iconChipColor}
          loading={loading}
        />
      ))}
    </div>
  );
}
