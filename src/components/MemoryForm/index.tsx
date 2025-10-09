"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import styles from "./MemoryForm.module.css";

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
    <div className={styles.memoryFormContainer}>
      <p>どんな気持ち？</p>
      <div className={styles.emotionSelector}>
        {emotions.map((emotion) => (
          <button
            key={emotion}
            type="button"
            className={`${styles.emotionButton} ${
              selectedEmotion === emotion ? styles.selected : ""
            }`}
            onClick={() => setSelectedEmotion(emotion)}
          >
            {emotion}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="思い出を書き留めよう..."
          rows={4}
          required
        />
        <div className={styles.imageUploadContainer}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
            id="imageUpload"
          />
          <label htmlFor="imageUpload" className={styles.fileInputLabel}>
            画像を選択
          </label>
          {imageUrlPreview && (
            <div className={styles.imagePreviewWrapper}>
              <img
                src={imageUrlPreview}
                alt="Preview"
                className={styles.imagePreview}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearImage();
                }}
                className={styles.clearImageButton}
              >
                ×
              </button>
            </div>
          )}
        </div>
        <div className={styles.buttonGroup}>
          {onCancel && (
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              キャンセル
            </button>
          )}
          <button
            type="submit"
            className={
              buttonText === "更新" ? styles.updateButton : styles.submitButton
            }
          >
            {buttonText}
          </button>
        </div>
      </form>
    </div>
  );
}
