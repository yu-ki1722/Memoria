"use client";

import { useState } from "react";
import styles from "./MemoryForm.module.css";

const emotions = ["😊", "😂", "😍", "😢", "😮", "🤔"];

type MemoryFormProps = {
  onSave: (emotion: string, text: string) => void;
  buttonText: string;
  initialEmotion?: string | null;
  initialText?: string;
  onCancel?: () => void;
};

export default function MemoryForm({
  onSave,
  buttonText,
  initialEmotion,
  initialText,
}: MemoryFormProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(
    initialEmotion || null
  );
  const [text, setText] = useState(initialText || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion) {
      alert("感情を選んでください。");
      return;
    }

    onSave(selectedEmotion, text);
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
        <button
          type="submit"
          className={
            buttonText === "更新" ? styles.updateButton : styles.submitButton
          }
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
}
