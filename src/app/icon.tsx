import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="64" height="64" viewBox="0 0 24 24">
        <defs>
          <linearGradient id="g" x1="2" y1="3" x2="22" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#facc15" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="9.25" fill="url(#g)" />
        <path d="M2.75 12a9.25 9.25 0 0 0 18.5 0z" fill="#0b0f19" />
        <rect x="2.75" y="10.9" width="18.5" height="2.2" fill="#0b0f19" />
        <circle cx="12" cy="12" r="9.25" fill="none" stroke="#0b0f19" strokeWidth="1.1" />
        <circle cx="12" cy="12" r="3" fill="#0b0f19" />
        <circle cx="12" cy="12" r="2.1" fill="url(#g)" />
      </svg>
    ),
    { ...size },
  );
}
