"use client";

import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import Button from "./Button";
import Image from "next/image";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function MemoryForm({
  onSave,
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
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");

  useEffect(() => {
    const uniqueTags = new Set([...defaultTags, ...(initialTags || [])]);
    setAvailableTags(Array.from(uniqueTags));
  }, [initialTags]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setImageWasCleared(false);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImageUrlPreview(URL.createObjectURL(file));
    }
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImageUrlPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag && !availableTags.includes(trimmedTag)) {
      setAvailableTags([...availableTags, trimmedTag]);
      setSelectedTags([...selectedTags, trimmedTag]);
    }
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
        w-64 flex flex-col gap-4 p-4 rounded-lg animate-softAppear transition-all duration-300
        ${
          styleKey
            ? `bg-emotion-${styleKey} shadow-glow-${styleKey}`
            : "bg-gray-100 shadow-lg"
        }
      `}
    >
      <p className="font-bold text-center text-gray-700">どんな気持ち？</p>
      <div className="grid grid-cols-3 gap-2 justify-items-center">
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            id="imageUpload"
          />
          {imageUrlPreview ? (
            <div className="relative inline-block group">
              <Image
                src={imageUrlPreview}
                alt="Preview"
                width={100}
                height={100}
                className="rounded-lg object-cover border-2 border-white/50 shadow-soft-glow"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md transition-transform transform scale-0 group-hover:scale-100"
              >
                ×
              </button>
            </div>
          ) : (
            <label
              htmlFor="imageUpload"
              className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white/50 transition-colors"
            >
              <svg
                className="w-8 h-8 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-600">
                思い出を追加
              </span>
            </label>
          )}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="思い出を書き留めよう..."
          rows={4}
          required
          className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow shadow-sm focus:shadow-soft-glow"
        />

        <div ref={formRef}>
          {" "}
          <label className="text-sm font-semibold text-gray-700">タグ</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {availableTags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200
                    ${
                      isSelected
                        ? "bg-memoria-secondary text-white shadow-md"
                        : "bg-white/70 text-gray-700 border border-white/50 hover:bg-white/90"
                    }
                  `}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
          <div className="relative h-8 mt-2 flex items-center">
            <AnimatePresence>
              {isTagInputOpen && (
                <motion.div
                  key="tagInputForm"
                  className="absolute left-0 top-0 h-full bg-white border border-gray-300 rounded-full flex items-center overflow-hidden"
                  initial={{ width: 32 }}
                  animate={{ width: 222 }}
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
              className={`
                      w-7 h-7 rounded-full text-xs font-medium transition-colors duration-200
                      bg-white/70 text-gray-700 border border-white/50 hover:bg-white/90
                      flex items-center justify-center flex-shrink-0
                    `}
              animate={{ x: isTagInputOpen ? 190 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Plus size={14} />
            </motion.button>
          </div>
        </div>

        <div className="flex gap-3">
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
