"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
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
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showAllTags, setShowAllTags] = useState(false);
  const [prefectureInput, setPrefectureInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [placeInput, setPlaceInput] = useState("");

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

      if (selectedTags.length > 0) {
        queryBuilder.overlaps("tags", selectedTags);
      }

      if (startDate && endDate) {
        queryBuilder.gte("created_at", startDate).lte("created_at", endDate);
      }

      if (query.trim() !== "") {
        queryBuilder.ilike("text", `%${query.trim()}%`);
      }

      if (prefectureInput.trim() !== "") {
        queryBuilder.ilike("prefecture", `%${prefectureInput.trim()}%`);
      }
      if (cityInput.trim() !== "") {
        queryBuilder.ilike("city", `%${cityInput.trim()}%`);
      }
      if (placeInput.trim() !== "") {
        queryBuilder.ilike("place_name", `%${placeInput.trim()}%`);
      }

      const { data, error } = await queryBuilder;

      if (error) {
        console.error("検索エラー:", error);
        return;
      }

      onFilterResults(data ?? []);
    } catch (err) {
      console.error("検索中にエラー:", err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const delay = setTimeout(() => {
      handleSearch();
    }, 400);

    return () => clearTimeout(delay);
  }, [
    query,
    selectedEmotions,
    selectedTags,
    startDate,
    endDate,
    prefectureInput,
    cityInput,
    placeInput,
  ]);

  const handleReset = async () => {
    setQuery("");
    setSelectedEmotions([]);
    setSelectedTags([]);
    setStartDate("");
    setEndDate("");
    setPrefectureInput("");
    setCityInput("");
    setPlaceInput("");

    const { data, error } = await supabase.from("memories").select("*");
    if (error) {
      console.error("リセット時の取得エラー:", error);
      return;
    }

    onFilterResults(data ?? []);
    onClose();
  };

  const DRAG_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 500;

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (
      info.offset.y > DRAG_THRESHOLD ||
      info.velocity.y > VELOCITY_THRESHOLD
    ) {
      onClose();
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
                ? "left-0 right-0 bottom-0 h-[70%]"
                : "top-0 right-0 h-full w-[420px]"
            }`}
            initial={isMobile ? { y: "100%" } : { x: "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: "100%" }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
            {...(isMobile
              ? {
                  drag: "y",
                  dragConstraints: { top: 0 },
                  dragElastic: 0.1,
                  onDragEnd: handleDragEnd,
                }
              : {})}
          >
            <div className="flex flex-col h-full">
              {isMobile && (
                <div
                  className="flex-shrink-0 flex justify-center items-center pt-3 pb-2"
                  style={{ cursor: "grab" }}
                >
                  <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>
              )}

              <div className="flex justify-between items-center border-b px-6 py-4 flex-shrink-0 bg-white">
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

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                <div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="キーワードを入力..."
                    className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

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

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    タグで絞り込む
                  </h3>

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
                      <>
                        <div
                          className={`flex flex-wrap gap-3 transition-all duration-300 overflow-hidden ${
                            showAllTags ? "max-h-[1000px]" : "max-h-[120px]"
                          }`}
                        >
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

                        {normalTags.length > 10 && (
                          <div className="mt-2 text-center">
                            <button
                              onClick={() => setShowAllTags((prev) => !prev)}
                              className="text-sm text-gray-700 hover:underline font-medium"
                            >
                              {showAllTags ? "閉じる ▲" : "すべて表示 ▼"}
                            </button>
                          </div>
                        )}
                      </>
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
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <span className="text-gray-400">〜</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">
                    場所で絞り込む
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        都道府県
                      </label>
                      <input
                        type="text"
                        value={prefectureInput}
                        onChange={(e) => setPrefectureInput(e.target.value)}
                        placeholder="例: 東京都"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        市区町村
                      </label>
                      <input
                        type="text"
                        value={cityInput}
                        onChange={(e) => setCityInput(e.target.value)}
                        placeholder="例: 渋谷区"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        施設名
                      </label>
                      <input
                        type="text"
                        value={placeInput}
                        onChange={(e) => setPlaceInput(e.target.value)}
                        placeholder="例: 東京タワー"
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t flex-shrink-0 mt-3 bg-white px-4 pb-4">
                <div className="flex flex-col gap-2 w-full max-w-[360px] mx-auto">
                  <button
                    onClick={handleReset}
                    className="w-full py-2 rounded-xl bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                  >
                    検索をリセット
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
