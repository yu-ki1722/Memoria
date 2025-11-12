"use client";

import { Tag } from "lucide-react";

type TagManagerButtonProps = {
  onClick: () => void;
  className?: string;
};

export default function TagManagerButton({
  onClick,
  className = "",
}: TagManagerButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute top-[8rem] right-4 z-[1001]
        bg-white rounded-full shadow-md
        p-3 hover:bg-gray-100 transition
        flex items-center justify-center
        ${className}
      `}
      aria-label="タグ管理"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-[15px] h-[15px] text-gray-700"
      >
        <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82z" />
        <circle cx="6.5" cy="6.5" r="1.5" />
      </svg>
    </button>
  );
}
