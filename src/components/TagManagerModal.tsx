"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";

type Tag = {
  id: number;
  name: string;
  is_favorite: boolean;
  order: number;
  user_id: string;
};

type TagManagerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function TagManagerModal({
  isOpen,
  onClose,
}: TagManagerModalProps) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!isOpen) return;
    const fetchTags = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("order", { ascending: true });

      if (error) {
        console.error("タグの取得エラー:", error);
      } else {
        setTags(data || []);
      }
      setIsLoading(false);
    };

    fetchTags();
  }, [isOpen]);

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
                  タグ一覧
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                >
                  ×
                </button>
              </div>

              <div className="flex-1 overflow-y-auto mt-4">
                {isLoading ? (
                  <p className="text-center text-sm text-gray-500">
                    読み込み中...
                  </p>
                ) : tags.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 mt-10">
                    タグがまだありません
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium shadow-sm"
                      >
                        #{tag.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
