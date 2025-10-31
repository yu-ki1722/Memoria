"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PlaceSearchModal({ isOpen, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-[1999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="
              fixed md:right-0 md:top-0 md:w-[400px] md:h-full
              bottom-0 w-full h-[70vh]
              bg-white rounded-t-2xl md:rounded-none shadow-xl
              z-[2000] flex flex-col
            "
            initial={{ y: "100%", opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              transition: { type: "spring", damping: 25, stiffness: 200 },
            }}
            exit={{ y: "100%", opacity: 0 }}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">場所を検索</h2>
              <button onClick={onClose}>
                <X size={24} className="text-gray-600 hover:text-black" />
              </button>
            </div>

            <div className="p-4">
              <input
                type="text"
                placeholder="場所名・住所を入力"
                className="
                  w-full px-4 py-2 border rounded-lg focus:ring-2 
                  focus:ring-blue-400 outline-none text-sm
                "
              />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              <p className="text-gray-500 text-sm">検索結果をここに表示</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
