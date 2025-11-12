"use client";

import { TbMapPinHeart, TbTags } from "react-icons/tb";
import { BiPhotoAlbum } from "react-icons/bi";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const activeClass = "text-memoria-secondary";
  const inactiveClass =
    "text-memoria-text/70 hover:text-memoria-secondary transition";

  return (
    <footer className="fixed bottom-0 left-0 w-full h-16 bg-memoria-background/80 backdrop-blur-sm shadow-sm border-t border-gray-200 flex justify-around items-center z-50 md:hidden">
      <motion.button
        onClick={() => router.push("/tag-manager")}
        whileTap={{ scale: 0.9, opacity: 0.8 }}
        className={`flex flex-col items-center ${
          pathname === "/tag-manager" ? activeClass : inactiveClass
        }`}
      >
        <TbTags className="w-7 h-7 mb-1" />
        <span className="text-[10px] font-medium">タグ</span>
      </motion.button>

      <motion.button
        onClick={() => router.push("/map")}
        whileTap={{ scale: 0.9, opacity: 0.8 }}
        className={`flex flex-col items-center ${
          pathname === "/map" ? activeClass : inactiveClass
        }`}
      >
        <TbMapPinHeart className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">マップ</span>
      </motion.button>

      <motion.button
        onClick={() => router.push("/memories")}
        whileTap={{ scale: 0.9, opacity: 0.8 }}
        className={`flex flex-col items-center ${
          pathname === "/memories" ? activeClass : inactiveClass
        }`}
      >
        <BiPhotoAlbum className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">思い出</span>
      </motion.button>
    </footer>
  );
}
