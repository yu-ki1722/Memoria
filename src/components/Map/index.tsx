"use client";

import type { Session } from "@supabase/auth-helpers-nextjs";
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
import MapSearch from "../MapSearch";
import CurrentLocation from "../CurrentLocation";
import Header from "../Header";

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
  user_id: string;
};

function LocationMarker({
  session,
  setNewPosition,
}: {
  session: Session | null;
  setNewPosition: (position: L.LatLng) => void;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      if (session) {
        setNewPosition(e.latlng);
      }
    },
  });

  return null;
}

export default function Map({ session }: { session: Session }) {
  const initialPosition: [number, number] = [35.6895, 139.6917];
  const [newPosition, setNewPosition] = useState<L.LatLng | null>(null);
  const markerRef = useRef<L.Marker>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemory, setEditingMemory] = useState<number | null>(null);

  useEffect(() => {
    const fetchMemories = async () => {
      const user = session.user;
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching memories:", error);
      } else {
        setMemories(data);
      }
    };

    if (session) {
      fetchMemories();
    }
  }, [session]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [newPosition]);

  const handleSaveMemory = async (emotion: string, text: string) => {
    if (!newPosition) return;
    const user = session.user;

    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          emotion: emotion,
          text: text,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
          user_id: user.id,
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
    } else if (data) {
      alert("思い出を更新しました。");
      setMemories(
        memories.map((memory) => (memory.id === id ? data[0] : memory))
      );
      setEditingMemory(null);
    }
  };

  return (
    <>
      <Header session={session} />
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: "100vh", width: "100wh" }}
      >
        <MapSearch />
        <CurrentLocation />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker session={session} setNewPosition={setNewPosition} />
        {memories.map((memory) => (
          <Marker
            key={memory.id}
            position={[memory.latitude, memory.longitude]}
          >
            <Popup>
              {editingMemory === memory.id ? (
                <div className={styles.memoryPopup}>
                  <MemoryForm
                    onSave={(emotion, text) =>
                      handleUpdateMemory(memory.id, emotion, text)
                    }
                    buttonText="更新"
                    initialEmotion={memory.emotion}
                    initialText={memory.text}
                    onCancel={() => setEditingMemory(null)}
                  />
                </div>
              ) : (
                <div className={styles.memoryPopup}>
                  <span className={styles.emotion}>{memory.emotion}</span>
                  <p>{memory.text}</p>
                  {session.user.id === memory.user_id && (
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
                  )}
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
    </>
  );
}
