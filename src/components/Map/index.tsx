"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LeafletMouseEvent } from "leaflet";
import MemoryForm from "../MemoryForm";
import { supabase } from "@/lib/supabaseClient";
import styles from "./Map.module.css";

// Leafletのデフォルトアイコンが正しく表示されない問題の修正
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

type Memory = {
  id: number;
  emotion: string;
  text: string;
  latitude: number;
  longitude: number;
};

function LocationMarker({
  setNewPosition,
}: {
  setNewPosition: (position: L.LatLng) => void;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      setNewPosition(e.latlng);
    },
  });

  return null;
}

export default function Map() {
  const initialPosition: [number, number] = [35.6895, 139.6917];
  const [newPosition, setNewPosition] = useState<L.LatLng | null>(null);
  const markerRef = useRef<L.Marker>(null);

  const [memories, setMemories] = useState<Memory[]>([]);

  const [editingMemory, setEditingMemory] = useState<number | null>(null);

  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase.from("memories").select("*");
      if (error) {
        console.error("Error fetching memories:", error);
      } else {
        setMemories(data);
      }
    };
    fetchMemories();
  }, []);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [newPosition]);

  const handleSaveMemory = async (emotion: string, text: string) => {
    if (!newPosition) return;

    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          emotion: emotion,
          text: text,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
        },
      ])
      .select();

    if (error) {
      alert("エラーが発生しました：" + error.message);
    } else if (data) {
      alert("思い出を記録しました！");
      setMemories([...memories, data[0]]);
      setNewPosition(null);
    }
  };

  const handleDeleteMemory = async (id: number) => {
    // 確認ダイアログを表示
    if (!window.confirm("この思い出を本当に削除しますか？")) {
      return;
    }

    const { error } = await supabase.from("memories").delete().eq("id", id);

    if (error) {
      alert("削除中にエラーが発生しました：" + error.message);
    } else {
      alert("思い出を削除しました。");
      setMemories(memories.filter((memory) => memory.id !== id));
    }
  };

  const handleUpdateMemory = async (
    id: number,
    emotion: string,
    text: string
  ) => {
    const { data, error } = await supabase
      .from("memories")
      .update({ text: text, emotion: emotion })
      .eq("id", id)
      .select();

    if (error) {
      alert("更新中にエラーが発生しました：" + error.message);
    } else {
      alert("思い出を更新しました。");
      setMemories(
        memories.map((memory) => (memory.id === id ? data[0] : memory))
      );
      setEditingMemory(null);
    }
  };

  return (
    <MapContainer
      center={initialPosition}
      zoom={13}
      style={{ height: "100vh", width: "100wh" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <LocationMarker setNewPosition={setNewPosition} />

      {memories.map((memory) => (
        <Marker key={memory.id} position={[memory.latitude, memory.longitude]}>
          <Popup>
            {editingMemory === memory.id ? (
              <MemoryForm
                onSave={(emotion, text) =>
                  handleUpdateMemory(memory.id, emotion, text)
                }
                buttonText="更新"
                initialEmotion={memory.emotion}
                initialText={memory.text}
              />
            ) : (
              <div className={styles.memoryPopup}>
                <span className={styles.emotion}>{memory.emotion}</span>
                <p>{memory.text}</p>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMemory(memory.id);
                    }}
                    className={styles.editButton}
                  >
                    編集
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMemory(memory.id);
                    }}
                    className={styles.deleteButton}
                  >
                    削除
                  </button>
                </div>
              </div>
            )}
          </Popup>
        </Marker>
      ))}

      {newPosition && (
        <Marker position={newPosition} ref={markerRef}>
          <Popup>
            <MemoryForm onSave={handleSaveMemory} buttonText="記録する" />
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
