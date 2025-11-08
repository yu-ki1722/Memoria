"use client";
import { Search } from "lucide-react";

type SearchButtonProps = {
  onClick: () => void;
  className?: string;
};

export default function SearchButton({
  onClick,
  className = "",
}: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute top-20 right-4 z-[1002]
        bg-white rounded-full shadow-md
        p-3 hover:bg-gray-100 transition
        ${className}
      `}
      aria-label="検索"
    >
      <Search size={15} className="text-gray-700" />
    </button>
  );
}
