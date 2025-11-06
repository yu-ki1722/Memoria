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
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleEmotion = (emoji: string) => {
    setSelectedEmotions((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

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
                ? "left-0 right-0 bottom-0 h-[65%]"
                : "top-0 right-0 h-full w-[400px]"
            }`}
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            <div className="p-6 h-full flex flex-col relative overflow-y-auto">
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

              <div className="mt-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="キーワードを入力..."
                  className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                />
              </div>

              <div className="mt-6 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    感情で絞り込む
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["😊", "😂", "😍", "😢", "😮", "🤔"].map((emoji) => {
                      const isActive = selectedEmotions.includes(emoji);
                      return (
                        <motion.button
                          key={emoji}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => toggleEmotion(emoji)}
                          className={`px-3 py-2 rounded-full text-lg border transition-all duration-200 ${
                            isActive
                              ? "bg-blue-100 border-blue-400 text-blue-700 shadow-inner"
                              : "bg-white border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          {emoji}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    タグで絞り込む
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {["旅行", "友達", "家族", "風景", "食べ物", "日常"].map(
                      (tag) => {
                        const isActive = selectedTags.includes(tag);
                        return (
                          <motion.button
                            key={tag}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleTag(tag)}
                            className={`px-3 py-1 rounded-full text-sm border transition-all duration-200 ${
                              isActive
                                ? "bg-memoria-secondary text-white border-memoria-secondary-dark shadow-inner"
                                : "bg-white border-gray-300 hover:bg-memoria-secondary/20"
                            }`}
                          >
                            #{tag}
                          </motion.button>
                        );
                      }
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    日付で絞り込む
                  </h3>
                  <div className="flex gap-2 items-center">
                    <input
                      type="date"
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-400">〜</span>
                    <input
                      type="date"
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() =>
                      alert(
                        `キーワード: ${query}\n感情: ${selectedEmotions.join(
                          ", "
                        )}\nタグ: ${selectedTags.join(", ")}`
                      )
                    }
                    className="w-full py-2 rounded-xl bg-memoria-primary text-white font-semibold hover:bg-opacity-90 transition"
                  >
                    絞り込み検索を実行
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
