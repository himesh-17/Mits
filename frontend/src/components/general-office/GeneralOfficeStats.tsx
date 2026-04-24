"use client";

import { useEffect, useRef, useState } from "react";

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
  valueColor: string;
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
      valueColor: "text-[#F59E0B]",
      lineColor: "bg-[#E5E7EB]",
    },
    {
      title: "Documents Pending",
      value: stats.documentsPending,
      valueColor: "text-[#2F6FE0]",
      lineColor: "bg-[#2F6FE0]",
    },
    {
      title: "Final Approvals",
      value: stats.finalApprovals,
      valueColor: "text-[#10B981]",
      lineColor: "bg-[#E5E7EB]",
    },
    {
      title: "Total Active Apps",
      value: stats.totalActiveApps,
      valueColor: "text-[#111827]",
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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {statCards.map((card, index) => (
        <div
          key={card.title}
          className="rounded-md border border-[#D5D4D4] bg-white p-4"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="mb-3">
            <h3 className="pr-2 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#6B7280]">
              {card.title}
            </h3>
          </div>

          <div className="mb-3 flex items-baseline gap-2">
            <p className={`text-[34px] font-bold leading-none ${card.valueColor}`} style={{ fontFamily: "var(--font-poppins)" }}>
              {loading ? (
                <span className="animate-pulse">-</span>
              ) : (
                <AnimatedNumber value={card.value} duration={600} />
              )}
            </p>
          </div>

          <div className="h-0.5 rounded-full bg-[#E5E7EB]">
            <div className={`h-0.5 rounded-full ${card.lineColor}`} style={{ width: card.value > 0 ? "35%" : "0%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
