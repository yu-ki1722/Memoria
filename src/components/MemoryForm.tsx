"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import Button from "./Button";
import Image from "next/image";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

const emotionStyles = {
  "😊": { key: "happy", border: "border-emotion-border-happy" },
  "😂": { key: "laugh", border: "border-emotion-border-laugh" },
  "😍": { key: "love", border: "border-emotion-border-love" },
  "😢": { key: "sad", border: "border-emotion-border-sad" },
  "😮": { key: "surprise", border: "border-emotion-border-surprise" },
  "🤔": { key: "thinking", border: "border-emotion-border-thinking" },
} as const;

type Emotion = keyof typeof emotionStyles;
const emotions = Object.keys(emotionStyles) as Emotion[];

type MemoryFormProps = {
  onSave: (
    emotion: string,
    text: string,
    imageFile: File | null,
    imageWasCleared: boolean,
    tags: string[]
  ) => void;
  user: User | null;
  buttonText: string;
  initialEmotion?: string | null;
  initialText?: string;
  initialImageUrl?: string | null;
  initialTags?: string[] | null;
  onCancel?: () => void;
  isTagInputOpen: boolean;
  setIsTagInputOpen: (isOpen: boolean) => void;
};

const defaultTags = ["日常", "旅行", "食べ物"];

type SortOption = "newest" | "oldest" | "az" | "za";

type TagData = {
  name: string;
  is_favorite: boolean;
  created_at?: string | null;
};

export default function MemoryForm({
  onSave,
  user,
  buttonText,
  initialEmotion,
  initialText,
  initialImageUrl,
  initialTags,
  onCancel,
  isTagInputOpen,
  setIsTagInputOpen,
}: MemoryFormProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion | null>(
    (initialEmotion as Emotion) || null
  );
  const [text, setText] = useState(initialText || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState(
    initialImageUrl || null
  );
  const [imageWasCleared, setImageWasCleared] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags || []);
  const [availableTags, setAvailableTags] = useState<TagData[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  useEffect(() => {
    const fetchUserTags = async () => {
      if (!user) return;

      const { data: pref } = await supabase
        .from("user_preferences")
        .select("sort_option")
        .eq("user_id", user.id)
        .single();
      if (pref?.sort_option) setSortOption(pref.sort_option as SortOption);

      const { data, error } = await supabase
        .from("tags")
        .select("name, is_favorite, created_at, order")
        .eq("user_id", user.id)
        .order("order", { ascending: true });

      if (error) {
        console.error("タグの読み込みに失敗:", error);
        return;
      }

      const rows: TagData[] =
        (data ?? []).map((tag) => ({
          name: tag.name,
          is_favorite: tag.is_favorite,
          created_at: tag.created_at ?? null,
        })) ?? [];

      const defaults: TagData[] = defaultTags.map((name) => ({
        name,
        is_favorite: false,
        created_at: null,
      }));

      const combined: TagData[] = [...rows, ...defaults];

      const unique: TagData[] = Array.from(
        new Map<string, TagData>(combined.map((t) => [t.name, t])).values()
      );

      setAvailableTags(unique);
    };

    fetchUserTags();
  }, [user, sortOption]);

  const sortTags = (tags: TagData[], option: SortOption): TagData[] => {
    const sorted = [...tags];
    switch (option) {
      case "newest":
        sorted.sort(
          (a, b) =>
            new Date(b.created_at ?? 0).getTime() -
            new Date(a.created_at ?? 0).getTime()
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            new Date(a.created_at ?? 0).getTime() -
            new Date(b.created_at ?? 0).getTime()
        );
        break;
      case "az":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "ja"));
        break;
      case "za":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "ja"));
        break;
    }

    return sorted.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageWasCleared(false);
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrlPreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImageUrlPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setImageWasCleared(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion) {
      alert("感情を選んでください。");
      return;
    }
    onSave(selectedEmotion, text, imageFile, imageWasCleared, selectedTags);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddNewTag = async () => {
    if (!user) {
      alert("ログインが必要です");
      return;
    }

    const trimmedTag = newTagInput.trim();
    if (!trimmedTag) return;

    const alreadyExists = availableTags.some((t) => t.name === trimmedTag);
    if (alreadyExists) {
      alert("すでに存在するタグです");
      return;
    }

    const { data, error } = await supabase
      .from("tags")
      .insert([
        {
          name: trimmedTag,
          user_id: user.id,
          is_favorite: false,
        },
      ])
      .select("name, is_favorite, created_at")
      .single();

    if (error) {
      console.error("タグの追加に失敗:", error);
      return;
    }

    const newTagRow: TagData = {
      name: data.name,
      is_favorite: data.is_favorite,
      created_at: data.created_at ?? null,
    };

    setAvailableTags(sortTags([...availableTags, newTagRow], sortOption));
    setSelectedTags((prev) => [...prev, trimmedTag]);
    setNewTagInput("");
    setIsTagInputOpen(false);
  };

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        setIsTagInputOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styleKey = selectedEmotion ? emotionStyles[selectedEmotion].key : null;

  return (
    <div
      className={`
        w-80 flex flex-col gap-4 p-4 rounded-lg animate-softAppear transition-all duration-300
        ${
          styleKey
            ? `bg-emotion-${styleKey} shadow-glow-${styleKey}`
            : "bg-gray-100 shadow-lg"
        }
      `}
    >
      <p className="font-bold text-center text-gray-700">どんな気持ち？</p>

      <div className="grid grid-cols-6 gap-2 justify-items-center px-2">
        {emotions.map((emotion) => {
          const isSelected = selectedEmotion === emotion;
          const borderColorClass = emotionStyles[emotion].border;

          return (
            <button
              key={emotion}
              type="button"
              className={`w-11 h-11 rounded-full text-2xl flex items-center justify-center transition-all duration-200 transform ${
                isSelected
                  ? `bg-white/80 border-2 ${borderColorClass} scale-110`
                  : "bg-white/50 border-2 border-transparent hover:scale-110"
              }`}
              onClick={() => setSelectedEmotion(emotion)}
            >
              {emotion}
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
          id="imageUpload"
        />

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="思い出を書き留めよう..."
          rows={3}
          required
          className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow shadow-sm focus:shadow-glow"
        />

        {imageUrlPreview ? (
          <div className="relative inline-block group self-center w-full">
            <Image
              src={imageUrlPreview}
              alt="Preview"
              width={320}
              height={320}
              className="rounded-lg object-cover border-2 border-white/50 shadow-soft-glow w-full aspect-video"
            />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md"
            >
              ×
            </button>
          </div>
        ) : (
          <label
            htmlFor="imageUpload"
            className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white/50 transition-colors"
          >
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm font-semibold text-gray-600">
              写真を追加
            </span>
          </label>
        )}

        <div ref={formRef}>
          <label className="text-sm font-semibold text-gray-700">タグ</label>
          <div className="flex flex-col gap-3 mt-1 max-h-28 overflow-y-auto pr-1">
            {availableTags.some((t) => t.is_favorite) && (
              <div>
                <p className="text-xs text-yellow-600 font-semibold mb-1">
                  ★ お気に入り
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter((t) => t.is_favorite)
                    .map(({ name }) => {
                      const isSelected = selectedTags.includes(name);
                      return (
                        <button
                          type="button"
                          key={name}
                          onClick={() => toggleTag(name)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 border ${
                            isSelected
                              ? "bg-memoria-secondary text-white shadow-md"
                              : "bg-white text-gray-700 border-yellow-300"
                          }`}
                        >
                          #{name}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {availableTags.some((t) => !t.is_favorite) && (
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">
                  その他
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableTags
                    .filter((t) => !t.is_favorite)
                    .map(({ name }) => {
                      const isSelected = selectedTags.includes(name);
                      return (
                        <button
                          type="button"
                          key={name}
                          onClick={() => toggleTag(name)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 border ${
                            isSelected
                              ? "bg-memoria-secondary text-white shadow-md"
                              : "bg-white/70 text-gray-700 border-white/50 hover:bg-white/90"
                          }`}
                        >
                          #{name}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <div className="relative h-8 mt-2 flex items-center">
            <AnimatePresence>
              {isTagInputOpen && (
                <motion.div
                  key="tagInputForm"
                  className="absolute left-0 top-0 h-full bg-white border border-gray-300 rounded-full flex items-center overflow-hidden"
                  initial={{ width: 32 }}
                  animate={{ width: "100%" }}
                  exit={{ width: 32 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    #
                  </span>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddNewTag();
                      }
                    }}
                    placeholder="新しいタグ"
                    className="flex-1 px-3 pl-7 py-1 text-xs bg-transparent outline-none text-gray-800"
                    autoFocus
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isTagInputOpen) setIsTagInputOpen(true);
                else handleAddNewTag();
              }}
              className="w-7 h-7 rounded-full text-xs font-medium bg-white/70 text-gray-700 border border-white/50 hover:bg-white/90 flex items-center justify-center flex-shrink-0"
              animate={{ x: isTagInputOpen ? "calc(100% - 32px)" : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Plus size={14} />
            </motion.button>
          </div>
        </div>

        <div className="flex justify-end items-center gap-3 pt-2 border-t border-white/30">
          {onCancel && (
            <Button onClick={onCancel} variant="secondary" type="button">
              キャンセル
            </Button>
          )}
          <Button
            type="submit"
            variant={buttonText === "更新" ? "success" : "primary"}
          >
            {buttonText}
          </Button>
        </div>
      </form>
    </div>
  );
}
