"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import Button from "./Button";
import Image from "next/image";

const emotions = ["😊", "😂", "😍", "😢", "😮", "🤔"];

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
  const [selectedEmotion, setSelectedEmotion] = useState(
    initialEmotion || emotions[0]
  );
  const [text, setText] = useState(initialText || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrlPreview, setImageUrlPreview] = useState(
    initialImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageWasCleared, setImageWasCleared] = useState(false);

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
    onSave(selectedEmotion, text, imageFile, imageWasCleared);
  };

  return (
    <div className="w-52 flex flex-col gap-3">
      <p className="font-bold text-center text-gray-700">どんな気持ち？</p>
      <div className="flex justify-around flex-wrap">
        {emotions.map((emotion) => (
          <button
            key={emotion}
            type="button"
            className={`w-10 h-10 rounded-full text-2xl flex items-center justify-center transition-all duration-200 ${
              selectedEmotion === emotion
                ? "bg-blue-200 border-2 border-blue-500"
                : "bg-gray-200 border-2 border-transparent hover:scale-110"
            }`}
            onClick={() => setSelectedEmotion(emotion)}
          >
            {emotion}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="思い出を書き留めよう..."
          rows={4}
          required
          className="w-full p-2 border border-gray-300 rounded-md resize-vertical"
        />
        <div className="mt-2 border border-dashed border-gray-300 p-3 rounded-lg text-center relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            id="imageUpload"
          />
          <label
            htmlFor="imageUpload"
            className="text-sm font-semibold text-gray-600 cursor-pointer hover:text-blue-500"
          >
            画像を選択
          </label>
          {imageUrlPreview && (
            <div className="mt-3 relative inline-block">
              <Image
                src={imageUrlPreview}
                alt="Preview"
                width={80}
                height={80}
                className="rounded-md object-cover border border-gray-200"
              />
              <button
                type="button"
                onClick={handleClearImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center shadow-md hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-2">
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
