"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Star, ArrowUpDown } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

type Tag = {
  id: number;
  name: string;
  is_favorite: boolean;
  order: number;
  user_id: string;
  created_at?: string;
};

type SortOption = "newest" | "oldest" | "az" | "za";

export default function TagManagerPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const router = useRouter();

  useEffect(() => {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("tagSortOption")
        : null;
    if (
      saved === "newest" ||
      saved === "oldest" ||
      saved === "az" ||
      saved === "za"
    ) {
      setSortOption(saved);
    }
  }, []);

  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("order", { ascending: true });

      if (error) console.error("タグ取得エラー:", error);
      else setTags(sortTags(data || [], sortOption));
      setIsLoading(false);
    };
    fetchTags();
  }, [sortOption]);

  useEffect(() => {
    localStorage.setItem("tagOrder", JSON.stringify(tags.map((t) => t.id)));
  }, [tags]);

  const sortTags = (tags: Tag[], option: SortOption) => {
    switch (option) {
      case "newest":
        return [...tags].sort(
          (a, b) =>
            new Date(b.created_at ?? "").getTime() -
            new Date(a.created_at ?? "").getTime()
        );
      case "oldest":
        return [...tags].sort(
          (a, b) =>
            new Date(a.created_at ?? "").getTime() -
            new Date(b.created_at ?? "").getTime()
        );
      case "az":
        return [...tags].sort((a, b) => a.name.localeCompare(b.name, "ja"));
      case "za":
        return [...tags].sort((a, b) => b.name.localeCompare(a.name, "ja"));
      default:
        return tags;
    }
  };

  const handleSortChange = async (option: SortOption) => {
    setSortOption(option);
    localStorage.setItem("tagSortOption", option);

    const sorted = sortTags(tags, option);
    setTags(sorted);

    for (let i = 0; i < sorted.length; i++) {
      const { error } = await supabase
        .from("tags")
        .update({ order: i })
        .eq("id", sorted[i].id);
      if (error) console.error("順序更新エラー:", error);
    }
  };

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
      setTags((prev) => sortTags([...prev, data[0]], sortOption));
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
    <div className="relative min-h-screen bg-white overflow-hidden">
      <Header
        title="タグ一覧"
        rightActions={
          <>
            <button
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="text-gray-500 hover:text-blue-500 transition"
              title="並び替え"
            >
              <ArrowUpDown size={20} />
            </button>

            {sortMenuOpen && (
              <div className="absolute top-10 right-6 bg-white border border-gray-200 rounded-lg shadow-md text-sm text-gray-700 z-[2000] w-40">
                <button
                  onClick={() => handleSortChange("newest")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    sortOption === "newest" ? "font-semibold" : ""
                  }`}
                >
                  日付順（新しい順）
                </button>
                <button
                  onClick={() => handleSortChange("oldest")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    sortOption === "oldest" ? "font-semibold" : ""
                  }`}
                >
                  日付順（古い順）
                </button>
                <button
                  onClick={() => handleSortChange("az")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    sortOption === "az" ? "font-semibold" : ""
                  }`}
                >
                  名前順（A→Z）
                </button>
                <button
                  onClick={() => handleSortChange("za")}
                  className={`block w-full text-left px-3 py-2 hover:bg-gray-100 ${
                    sortOption === "za" ? "font-semibold" : ""
                  }`}
                >
                  名前順（Z→A）
                </button>
              </div>
            )}

            <button
              onClick={() => setDeleteMode(!deleteMode)}
              className={`transition ${
                deleteMode ? "text-red-500" : "text-gray-500 hover:text-red-500"
              }`}
              title="削除モード"
            >
              <Trash2 size={20} />
            </button>
          </>
        }
      />

      <main className="absolute top-[50px] bottom-[64px] left-0 right-0 overflow-y-auto p-6 pb-32 bg-white">
        {isLoading ? (
          <p className="text-center text-sm text-gray-500">読み込み中...</p>
        ) : (
          <>
            <TagSection
              title="★ お気に入りタグ"
              color="yellow"
              tags={favoriteTags}
              deleteMode={deleteMode}
              onDelete={handleDelete}
              onFavoriteToggle={toggleFavorite}
              emptyMessage="まだお気に入りタグはありません"
            />

            <TagSection
              title="タグ"
              color="gray"
              tags={otherTags}
              deleteMode={deleteMode}
              onDelete={handleDelete}
              onFavoriteToggle={toggleFavorite}
              emptyMessage="タグがありません"
            />
          </>
        )}

        <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 shadow-lg px-4 py-3 z-[1000]">
          <div className="flex items-center gap-2 max-w-lg mx-auto">
            <div className="relative flex-1 flex items-center bg-white border border-gray-200 rounded-full px-3 py-2 shadow-sm">
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
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TagSection({
  title,
  color,
  tags,
  deleteMode,
  onDelete,
  onFavoriteToggle,
  emptyMessage,
}: {
  title: string;
  color: "yellow" | "gray";
  tags: Tag[];
  deleteMode: boolean;
  onDelete: (id: number) => void;
  onFavoriteToggle: (id: number, current: boolean) => void;
  emptyMessage: string;
}) {
  return (
    <div>
      <h3
        className={`text-sm font-semibold ${
          color === "yellow" ? "text-yellow-600" : "text-gray-600"
        } mb-2`}
      >
        {title}
      </h3>
      {tags.length === 0 ? (
        <p className="text-xs text-gray-400 ml-1">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <motion.div key={tag.id} layout className="relative">
              <div
                className={`relative px-3 py-1 ${
                  color === "yellow"
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    : "bg-gray-100 text-gray-700"
                } rounded-full text-sm font-medium shadow-sm flex items-center gap-1`}
              >
                <button
                  onClick={() => onFavoriteToggle(tag.id, tag.is_favorite)}
                  className="text-yellow-400 hover:scale-110 transition"
                  title={
                    tag.is_favorite ? "お気に入り解除" : "お気に入りに追加"
                  }
                >
                  <Star
                    size={14}
                    fill={tag.is_favorite ? "gold" : "transparent"}
                    stroke="gold"
                  />
                </button>
                #{tag.name}
                <AnimatePresence>
                  {deleteMode && (
                    <motion.button
                      key="delete"
                      onClick={() => onDelete(tag.id)}
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
  );
}
