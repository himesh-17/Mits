"use client";

import { useEffect, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiFileText,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi";

interface GeneralOfficeStatsProps {
  stats: {
    awaitingVerification: number;
    documentsPending: number;
    finalApprovals: number;
    totalActiveApps: number;
  };
  loading: boolean;
  error?: string | null;
}

interface StatCardConfig {
  title: string;
  value: number;
  icon: React.ReactNode;
  valueColor: string;
  iconColor: string;
  lineColor: string;
}

// Reusable animated number component
function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!value) {
      setDisplayValue(0);
      return;
    }

    let startTime: number | null = null;
    const startValue = displayValue;

    const animate = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = Math.floor(startValue + (value - startValue) * progress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [value, duration, displayValue]);

  return <span>{displayValue}</span>;
}

export default function GeneralOfficeStats({
  stats,
  loading,
  error,
}: GeneralOfficeStatsProps) {
  const statCards: StatCardConfig[] = [
    {
      title: "Awaiting Verification",
      value: stats.awaitingVerification,
      icon: <FiAlertCircle className="w-6 h-6" />,
      valueColor: "text-[#F59E0B]",
      iconColor: "text-[#2DA8E1]",
      lineColor: "bg-[#E5E7EB]",
    },
    {
      title: "Documents Pending",
      value: stats.documentsPending,
      icon: <FiFileText className="w-6 h-6" />,
      valueColor: "text-[#2F6FE0]",
      iconColor: "text-[#F59E0B]",
      lineColor: "bg-[#2F6FE0]",
    },
    {
      title: "Final Approvals",
      value: stats.finalApprovals,
      icon: <FiCheckCircle className="w-6 h-6" />,
      valueColor: "text-[#10B981]",
      iconColor: "text-[#10B981]",
      lineColor: "bg-[#E5E7EB]",
    },
    {
      title: "Total Active Apps",
      value: stats.totalActiveApps,
      icon: <FiActivity className="w-6 h-6" />,
      valueColor: "text-[#111827]",
      iconColor: "text-[#3B82F6]",
      lineColor: "bg-[#9CA3AF]",
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        Failed to load statistics. Please try again.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card, index) => (
        <div
          key={card.title}
          className="rounded-lg border border-[#D5D4D4] bg-white p-5"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="mb-4 flex items-start justify-between">
            <h3 className="pr-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#6B7280]">
              {card.title}
            </h3>
            <div className={card.iconColor}>{card.icon}</div>
          </div>

          <div className="mb-4 flex items-baseline gap-2">
            <p className={`text-[40px] font-bold leading-none ${card.valueColor}`} style={{ fontFamily: "var(--font-poppins)" }}>
              {loading ? (
                <span className="animate-pulse">-</span>
              ) : (
                <AnimatedNumber value={card.value} duration={600} />
              )}
            </p>
            {!loading && <span className="text-[13px] text-[#9CA3AF]">items</span>}
          </div>

          <div className="h-1 rounded-full bg-[#E5E7EB]">
            <div className={`h-1 rounded-full ${card.lineColor}`} style={{ width: card.value > 0 ? "35%" : "0%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
