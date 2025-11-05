"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

type MemorySearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function MemorySearchModal({
  isOpen,
  onClose,
}: MemorySearchModalProps) {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-[1003]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className={`fixed z-[1004] bg-white shadow-xl rounded-t-2xl md:rounded-none md:rounded-l-2xl ${
              isMobile
                ? "left-0 right-0 bottom-0 h-[60%]"
                : "top-0 right-0 h-full w-[400px]"
            }`}
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            <div className="p-6 h-full flex flex-col relative">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Search size={20} className="text-blue-500" />
                  思い出検索
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="キーワードを入力..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
                <button
                  onClick={() => alert(`「${query}」で検索`)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition"
                >
                  検索
                </button>
              </div>

              <div className="mt-4 flex-1 overflow-y-auto">
                <p className="text-sm text-gray-500 text-center mt-8">
                  検索結果がここに表示されます
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
