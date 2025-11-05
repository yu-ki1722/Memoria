"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

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
  const [deleteMode, setDeleteMode] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  useEffect(() => {
    if (!isOpen) return;
    const fetchTags = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("order", { ascending: true });
      if (error) console.error("タグ取得エラー:", error);
      else setTags(data || []);
      setIsLoading(false);
    };
    fetchTags();
  }, [isOpen]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("このタグを削除しますか？")) return;
    const { error } = await supabase.from("tags").delete().eq("id", id);
    if (error) console.error("削除エラー:", error);
    else setTags(tags.filter((t) => t.id !== id));
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
                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setDeleteMode(!deleteMode)}
                    className={`transition ${
                      deleteMode
                        ? "text-red-500"
                        : "text-gray-500 hover:text-red-500"
                    }`}
                    title="削除モード"
                  >
                    <Trash2 size={20} />
                  </button>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto mt-2 pt-2 pb-6">
                {isLoading ? (
                  <p className="text-center text-sm text-gray-500">
                    読み込み中...
                  </p>
                ) : tags.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 mt-10">
                    タグがまだありません
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-3 justify-start items-start">
                    {tags.map((tag) => (
                      <motion.div key={tag.id} layout className="relative">
                        <div className="relative px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium shadow-sm">
                          #{tag.name}
                          <AnimatePresence>
                            {deleteMode && (
                              <motion.button
                                key="delete"
                                onClick={() => handleDelete(tag.id)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs shadow-md"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                ×
                              </motion.button>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
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
