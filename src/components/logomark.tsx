import { cn } from "@/lib/utils";

// A fanned trio of cards, standing in for a pack/hand of TCG cards —
// distinctive to a card marketplace rather than a generic sparkle/star.
export function Logomark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <rect
        x="3.5"
        y="4.5"
        width="9"
        height="13"
        rx="1.5"
        transform="rotate(-16 8 11)"
        fill="#38bdf8"
        fillOpacity="0.9"
      />
      <rect
        x="7.5"
        y="4"
        width="9"
        height="13"
        rx="1.5"
        fill="#a855f7"
        fillOpacity="0.9"
      />
      <rect
        x="11.5"
        y="4.5"
        width="9"
        height="13"
        rx="1.5"
        transform="rotate(16 16 11)"
        fill="#facc15"
      />
      <path
        d="M11 8.3l.9 1.85 2.05.3-1.48 1.44.35 2.03L11 12.9l-1.82.92.35-2.03-1.48-1.44 2.05-.3L11 8.3z"
        fill="#0b0f19"
        fillOpacity="0.55"
      />
    </svg>
  );
}
