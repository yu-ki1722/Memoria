"use client";

import { useState } from "react";
import styles from "./MemoryForm.module.css";

const emotions = ["😊", "😂", "😍", "😢", "😮", "🤔"];

export default function MemoryForm() {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: データをSupabaseに保存する処理をここに実装する
    console.log({
      emotion: selectedEmotion,
      text: text,
    });
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
