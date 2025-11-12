"use client";

import { Map, Tag, Images } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

type FooterProps = {
  onTagManagerOpen: () => void;
};

export default function Footer({ onTagManagerOpen }: FooterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const activeClass = "text-memoria-secondary";
  const inactiveClass =
    "text-memoria-text/70 hover:text-memoria-secondary transition";

  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 bg-memoria-background/80 backdrop-blur-sm shadow-sm border-t border-gray-200 flex justify-around items-center z-50 md:hidden">
      <button
        onClick={onTagManagerOpen}
        className={`flex flex-col items-center ${
          pathname === "/tag-manager" ? activeClass : inactiveClass
        }`}
      >
        <Tag className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">タグ</span>
      </button>

      <button
        onClick={() => router.push("/map")}
        className={`flex flex-col items-center ${
          pathname === "/map" ? activeClass : inactiveClass
        }`}
      >
        <Map className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">マップ</span>
      </button>

      <button
        onClick={() => router.push("/memories")}
        className={`flex flex-col items-center ${
          pathname === "/memories" ? activeClass : inactiveClass
        }`}
      >
        <Images className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">思い出</span>
      </button>
    </footer>
  );
}
