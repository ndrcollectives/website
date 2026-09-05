"use client";

import { useEffect, useState } from "react";

function getTimeParts(target: string) {
  const diff = Math.max(new Date(target).getTime() - Date.now(), 0);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

export function CountdownTimer({ releaseDate }: { releaseDate: string }) {
  const [parts, setParts] = useState(() => getTimeParts(releaseDate));

  useEffect(() => {
    const interval = setInterval(() => setParts(getTimeParts(releaseDate)), 1000);
    return () => clearInterval(interval);
  }, [releaseDate]);

  if (parts.done) {
    return (
      <span className="text-sm font-semibold text-accent-yellow">
        Released!
      </span>
    );
  }

  const units: [number, string][] = [
    [parts.days, "d"],
    [parts.hours, "h"],
    [parts.minutes, "m"],
    [parts.seconds, "s"],
  ];

  return (
    <div className="flex gap-2">
      {units.map(([value, label]) => (
        <div
          key={label}
          className="flex min-w-11 flex-col items-center rounded-md border border-border bg-surface-raised px-2 py-1"
        >
          <span className="font-mono text-sm font-bold text-accent-yellow tabular-nums">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase text-muted">{label}</span>
        </div>
      ))}
    </div>
  );
}
