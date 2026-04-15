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
  iconColor: string;
  borderColor: string;
  loading?: boolean;
}> = ({ title, value, icon, valueColor, iconColor, borderColor, loading = false }) => (
  <div
    className="rounded-xl border bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
    style={{
      borderColor: borderColor,
    }}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="mb-2 text-[12px] font-medium text-[#6B7280]">{title}</p>
        <div className={`text-[36px] font-bold leading-none ${valueColor}`} style={{ fontFamily: "var(--font-poppins)" }}>
          {loading ? (
            <span className="text-gray-300">-</span>
          ) : typeof value === "number" ? (
            <AnimatedNumber value={value} />
          ) : (
            value
          )}
        </div>
      </div>
      <div className={`h-5 w-5 ${iconColor}`}>{icon}</div>
    </div>
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
      valueColor: "text-[#2DA8E1]",
      iconColor: "text-[#2DA8E1]",
      borderColor: "#DBEAFE",
    },
    {
      title: "Finalized",
      value: data.finalized,
      icon: <FiCheck className="w-full h-full" />,
      valueColor: "text-[#10B981]",
      iconColor: "text-[#10B981]",
      borderColor: "#D1FAE5",
    },
    {
      title: "Awaiting Approval",
      value: data.awaitingApproval,
      icon: <FiClock className="w-full h-full" />,
      valueColor: "text-[#F59E0B]",
      iconColor: "text-[#F59E0B]",
      borderColor: "#FEF3C7",
    },
    {
      title: "Revenue Collected",
      value: data.revenueCollected,
      icon: <FiTrendingUp className="w-full h-full" />,
      valueColor: "text-[#A855F7]",
      iconColor: "text-[#A855F7]",
      borderColor: "#E9D5FF",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          valueColor={stat.valueColor}
          iconColor={stat.iconColor}
          borderColor={stat.borderColor}
          loading={loading}
        />
      ))}
    </div>
  );
}
