"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Button from "./Button";
import Image from "next/image";

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
    imageWasCleared: boolean
  ) => void;
  buttonText: string;
  initialEmotion?: string | null;
  initialText?: string;
  initialImageUrl?: string | null;
  onCancel?: () => void;
};

export default function MemoryForm({
  onSave,
  buttonText,
  initialEmotion,
  initialText,
  initialImageUrl,
  onCancel,
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
    onSave(selectedEmotion, text, imageFile, imageWasCleared);
  };

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
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="思い出を書き留めよう..."
          rows={4}
          required
          className="w-full p-3 bg-white/70 backdrop-blur-sm border border-white/30 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow shadow-sm focus:shadow-soft-glow"
        />

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
              className="text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-500"
            >
              画像を添付
            </label>
          )}
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
