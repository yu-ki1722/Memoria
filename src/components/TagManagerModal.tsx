"use client";

import { motion, AnimatePresence } from "framer-motion";

type TagManagerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TagManagerModal({
  isOpen,
  onClose,
}: TagManagerModalProps) {
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

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
            className={`
              fixed z-[1004] bg-white shadow-xl rounded-t-2xl md:rounded-none md:rounded-l-2xl
              ${
                isMobile
                  ? "left-0 right-0 bottom-0 h-[60%]"
                  : "top-0 right-0 h-full w-[400px]"
              }
            `}
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center border-b pb-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  タグ管理
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 overflow-y-auto mt-4 text-gray-600">
                <p>タグの一覧や編集UIを追加予定</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
