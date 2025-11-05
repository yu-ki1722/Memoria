"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Star } from "lucide-react";

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
  const [newTag, setNewTag] = useState("");
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
    if (error) {
      console.error("削除エラー:", error);
    } else {
      setTags(tags.filter((t) => t.id !== id));
    }
  };

  const handleAddTag = async () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    const isDuplicate = tags.some(
      (t) => t.name.trim().toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      alert("すでに存在するタグです");
      return;
    }

    const { data, error } = await supabase
      .from("tags")
      .insert([
        {
          name: trimmed,
          user_id: user.id,
          is_favorite: false,
          order: tags.length,
        },
      ])
      .select();

    if (error) {
      console.error("追加エラー:", error);
      alert("タグの追加に失敗しました");
    } else if (data) {
      setTags((prev) => [...prev, data[0]]);
      setNewTag("");
    }
  };

  const toggleFavorite = async (id: number, current: boolean) => {
    const updated = tags.map((t) =>
      t.id === id ? { ...t, is_favorite: !current } : t
    );
    setTags(updated);
    const { error } = await supabase
      .from("tags")
      .update({ is_favorite: !current })
      .eq("id", id);
    if (error) console.error("お気に入り更新エラー:", error);
  };

  const favoriteTags = tags.filter((t) => t.is_favorite);
  const otherTags = tags.filter((t) => !t.is_favorite);

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

              <div className="flex-1 overflow-y-auto mt-2 pt-2 pb-6 space-y-6">
                {isLoading ? (
                  <p className="text-center text-sm text-gray-500">
                    読み込み中...
                  </p>
                ) : (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-yellow-600 mb-2">
                        ★ お気に入りタグ
                      </h3>
                      {favoriteTags.length === 0 ? (
                        <p className="text-xs text-gray-400 ml-1">
                          まだお気に入りタグはありません
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {favoriteTags.map((tag) => (
                            <motion.div
                              key={tag.id}
                              layout
                              className="relative"
                            >
                              <div className="relative px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium shadow-sm flex items-center gap-1 border border-yellow-200">
                                <button
                                  onClick={() =>
                                    toggleFavorite(tag.id, tag.is_favorite)
                                  }
                                  className="text-yellow-500 hover:scale-110 transition"
                                  title="お気に入り解除"
                                >
                                  <Star size={14} fill="gold" stroke="gold" />
                                </button>
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

                    <hr className="border-gray-200" />

                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">
                        その他のタグ
                      </h3>
                      {otherTags.length === 0 ? (
                        <p className="text-xs text-gray-400 ml-1">
                          タグがありません
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {otherTags.map((tag) => (
                            <motion.div
                              key={tag.id}
                              layout
                              className="relative"
                            >
                              <div className="relative px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium shadow-sm flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    toggleFavorite(tag.id, tag.is_favorite)
                                  }
                                  className="text-yellow-400 hover:scale-110 transition"
                                  title="お気に入りに追加"
                                >
                                  <Star
                                    size={14}
                                    fill={
                                      tag.is_favorite ? "gold" : "transparent"
                                    }
                                    stroke="gold"
                                  />
                                </button>
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
                  </>
                )}
              </div>

              <div className="mt-auto pt-2 border-t flex items-center gap-2">
                <div className="relative flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                  <span className="text-gray-400 mr-1">#</span>
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="新しいタグ"
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <button
                    onClick={handleAddTag}
                    className="text-gray-600 hover:text-blue-500 transition"
                  >
                    <Plus size={16} />
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
