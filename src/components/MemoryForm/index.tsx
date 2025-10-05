"use client";

import { useState } from "react";
import styles from "./MemoryForm.module.css";

const emotions = ["😊", "😂", "😍", "😢", "😮", "🤔"];

type MemoryFormProps = {
  onSave: (emotion: string, text: string) => void;
};

export default function MemoryForm({ onSave }: MemoryFormProps) {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [text, setText] = useState("");

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
        <button type="submit" className={styles.submitButton}>
          記録する
        </button>
      </form>
    </div>
  );
}
