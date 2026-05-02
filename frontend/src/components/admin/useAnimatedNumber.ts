"use client";

import { useEffect, useState } from "react";

export function useAnimatedNumber(value: number, duration = 650) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const safeTarget = Number.isFinite(value) ? Math.max(0, value) : 0;
    const start = performance.now();

    let frameId = 0;

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(safeTarget * eased));

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frameId);
  }, [duration, value]);

  return animatedValue;
}