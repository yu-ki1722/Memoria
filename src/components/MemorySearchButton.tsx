"use client";

export default function MemorySearchButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="
        absolute top-[11rem] right-4 z-[1001]
        bg-white rounded-full shadow-md
        p-3 hover:bg-gray-100 transition
        flex items-center justify-center
      "
      aria-label="思い出を検索"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[15px] h-[15px] text-gray-700"
        transform="translate(1, 0) scale(1.3)"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="16.65" y1="16.65" x2="21" y2="21" />
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="currentColor"
          transform="translate(6.2, 6.3) scale(0.40)"
        />
      </svg>
    </button>
  );
}
