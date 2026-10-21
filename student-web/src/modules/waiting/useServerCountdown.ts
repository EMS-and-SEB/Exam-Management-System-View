import { useEffect, useState } from "react";

export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds >= 3600) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

// useServerCountdown hook
// Dependencies: startsAt, offsetMs
export function useServerCountdown(
  startsAt: string | null,
  offsetMs: number | null,
) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!startsAt || offsetMs === null) return;
    const first = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [startsAt, offsetMs]);

  if (!startsAt || offsetMs === null || now === null) {
    return { remainingSeconds: null, label: "--:--", isReady: false };
  }

  const diff = Math.ceil((Date.parse(startsAt) - (now + offsetMs!)) / 1000);
  const remainingSeconds = Math.max(0, diff);
  const isReady = remainingSeconds === 0;
  const label = isReady ? "Ready!" : formatCountdown(remainingSeconds);
  return { remainingSeconds, label, isReady };
}