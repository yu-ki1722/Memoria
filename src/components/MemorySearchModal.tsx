"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Star } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Memory = {
  id: number;
  emotion: string;
  text: string;
  latitude: number;
  longitude: number;
  user_id: string;
  image_url: string | null;
  tags: string[] | null;
};

type MemorySearchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFilterResults: (filtered: Memory[]) => void;
};

export default function MemorySearchModal({
  isOpen,
  onClose,
  onFilterResults,
}: MemorySearchModalProps) {
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [favoriteTags, setFavoriteTags] = useState<string[]>([]);
  const [normalTags, setNormalTags] = useState<string[]>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchTags = useCallback(async () => {
    const { data, error } = await supabase
      .from("tags")
      .select("name, is_favorite")
      .order("order", { ascending: true });

    if (error) {
      console.error("タグ取得エラー:", error);
      return;
    }

    const favorites = data.filter((t) => t.is_favorite).map((t) => t.name);
    const normals = data.filter((t) => !t.is_favorite).map((t) => t.name);

    setFavoriteTags(favorites);
    setNormalTags(normals);
  }, []);

  useEffect(() => {
    if (isOpen) fetchTags();
  }, [isOpen, fetchTags]);

  useEffect(() => {
    if (!isOpen) return;

    const channel = supabase
      .channel("tags-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tags" },
        () => {
          console.log("タグ更新検知、再取得中...");
          fetchTags();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, fetchTags]);

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

  const handleSearch = async () => {
    try {
      const queryBuilder = supabase.from("memories").select("*");

      if (selectedEmotions.length > 0) {
        queryBuilder.in("emotion", selectedEmotions);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error("検索エラー:", error);
        return;
      }

      onFilterResults(data ?? []);
      onClose();
    } catch (err) {
      console.error("検索中にエラー:", err);
    }
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
            <div className="p-6 h-full flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center border-b pb-3 flex-shrink-0">
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

              <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex-shrink-0 space-y-5">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="キーワードを入力..."
                    className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />

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
                </div>

                <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                  <div className="flex-shrink-0">
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">
                      タグで絞り込む
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-1 space-y-5">
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-yellow-600 mb-1">
                        ★ お気に入りタグ
                      </h4>
                      {favoriteTags.length === 0 ? (
                        <p className="text-xs text-gray-400 ml-1">
                          お気に入りタグがありません
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {favoriteTags.map((tag) => {
                            const isActive = selectedTags.includes(tag);
                            return (
                              <motion.div key={tag} layout>
                                <button
                                  onClick={() => toggleTag(tag)}
                                  className={`relative px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border shadow-sm transition-all duration-200 ${
                                    isActive
                                      ? "bg-yellow-400 text-white border-yellow-500 shadow-inner"
                                      : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100"
                                  }`}
                                >
                                  <Star
                                    size={14}
                                    fill="gold"
                                    stroke="gold"
                                    className="text-yellow-400"
                                  />
                                  #{tag}
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-600 mb-1">
                        タグ
                      </h4>
                      {normalTags.length === 0 ? (
                        <p className="text-xs text-gray-400 ml-1">
                          タグがありません
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {normalTags.map((tag) => {
                            const isActive = selectedTags.includes(tag);
                            return (
                              <motion.div key={tag} layout>
                                <button
                                  onClick={() => toggleTag(tag)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium border shadow-sm transition-all duration-200 ${
                                    isActive
                                      ? "bg-memoria-secondary text-white border-memoria-secondary-dark shadow-inner"
                                      : "bg-gray-100 text-gray-700 hover:bg-memoria-secondary/10"
                                  }`}
                                >
                                  #{tag}
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
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

                <div className="pt-4 border-t flex-shrink-0 mt-3 bg-white">
                  <button
                    onClick={handleSearch}
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
