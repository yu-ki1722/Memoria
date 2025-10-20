"use client";

type Props = {
  startColor: string;
  endColor: string;
  className?: string;
};

export default function MemoryPinIcon({
  startColor,
  endColor,
  className,
}: Props) {
  const gradientId = `pin-gradient-${startColor}-${endColor}`.replace(/#/g, "");

  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>
      </defs>
      <path
        d="M256 48c-91.6 0-166 74.4-166 166 0 111.2 166 250 166 250s166-138.8 166-250c0-91.6-74.4-166-166-166zM256 288c-51.9 0-94-42.1-94-94s42.1-94 94-94 94 42.1 94 94-42.1 94-94 94z"
        fill={`url(#${gradientId})`}
      />
      <path
        transform="translate(0, -15)"
        d="M256 168 c-16.7-19.9-49.2-20.6-65.3 2.2 c-15.7 22.2 1.2 47.4 24.7 67.7 c9.8 8.5 25.1 20.5 40.6 33.1 c15.5-12.6 30.8-24.6 40.6-33.1 c23.5-20.3 40.4-45.5 24.7-67.7 c-16.1-22.8-48.6-22.1-65.3-2.2z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
