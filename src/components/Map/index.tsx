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
import Header from "../Header";
import MapSearch from "../MapSearch";
import CurrentLocation from "../CurrentLocation";
import Image from "next/image";

// Leafletアイコン修正
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
  image_url: string | null;
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
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id);
      if (error) console.error("Error fetching memories:", error);
      else if (data) setMemories(data);
    };
    if (session) fetchMemories();
  }, [session]);

  useEffect(() => {
    if (newPosition && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [newPosition]);

  const handleSaveMemory = async (
    emotion: string,
    text: string,
    imageFile: File | null
  ) => {
    if (!newPosition || !session) return;
    let imageUrl: string | undefined = undefined;

    if (imageFile) {
      const sanitizeFileName = (fileName: string) =>
        fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9.\-_]/g, "");
      let finalName = sanitizeFileName(imageFile.name);
      if (finalName.startsWith(".")) finalName = `file${finalName}`;
      const filePath = `${session.user.id}/${Date.now()}-${finalName}`;

      const { error: uploadError } = await supabase.storage
        .from("memory-images")
        .upload(filePath, imageFile);
      if (uploadError) {
        alert("画像アップロード失敗: " + uploadError.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("memory-images")
        .getPublicUrl(filePath);
      imageUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from("memories")
      .insert([
        {
          emotion,
          text,
          user_id: session.user.id,
          image_url: imageUrl,
          latitude: newPosition.lat,
          longitude: newPosition.lng,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("保存失敗: " + error.message);
    } else if (data) {
      setMemories([...memories, data]);
      setNewPosition(null);
      alert("思い出を記録しました！");
    }
  };

  const handleDeleteMemory = async (id: number) => {
    if (!window.confirm("この思い出を本当に削除しますか？")) {
      return;
    }

    const memoryToDelete = memories.find((memory) => memory.id === id);

    if (memoryToDelete && memoryToDelete.image_url) {
      const filePath = memoryToDelete.image_url.split("/").slice(-2).join("/");
      const { error: deleteError } = await supabase.storage
        .from("memory-images")
        .remove([filePath]);

      if (deleteError) {
        alert("画像の削除に失敗しました: " + deleteError.message);
      }
    }

    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) {
      alert("削除中にエラーが発生しました：" + error.message);
    } else {
      setMemories(memories.filter((memory) => memory.id !== id));
      alert("思い出を削除しました。");
    }
  };

  const handleUpdateMemory = async (
    id: number,
    emotion: string,
    text: string,
    imageFile: File | null,
    imageWasCleared: boolean
  ) => {
    const originalMemory = memories.find((m) => m.id === id);
    if (!originalMemory) return;

    let finalImageUrl: string | null = originalMemory.image_url;

    if (imageFile) {
      if (originalMemory.image_url) {
        const oldFilePath = originalMemory.image_url
          .split("/")
          .slice(-2)
          .join("/");
        await supabase.storage.from("memory-images").remove([oldFilePath]);
      }

      const sanitizeFileName = (fileName: string) =>
        fileName.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9.\-_]/g, "");
      let finalName = sanitizeFileName(imageFile.name);
      if (finalName.startsWith(".")) finalName = `file${finalName}`;
      const newFilePath = `${session.user.id}/${Date.now()}-${finalName}`;

      const { error: uploadError } = await supabase.storage
        .from("memory-images")
        .upload(newFilePath, imageFile);

      if (uploadError) {
        return alert("新しい画像のアップロードに失敗: " + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from("memory-images")
        .getPublicUrl(newFilePath);
      finalImageUrl = urlData.publicUrl;
    } else if (imageWasCleared && originalMemory.image_url) {
      const oldFilePath = originalMemory.image_url
        .split("/")
        .slice(-2)
        .join("/");
      await supabase.storage.from("memory-images").remove([oldFilePath]);
      finalImageUrl = null;
    }

    const { data, error } = await supabase
      .from("memories")
      .update({ text: text, emotion: emotion, image_url: finalImageUrl })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      alert("更新中にエラーが発生しました：" + error.message);
    } else if (data) {
      setMemories(memories.map((m) => (m.id === id ? data : m)));
      setEditingMemory(null);
      alert("思い出を更新しました。");
    }
  };

  return (
    <>
      <Header session={session} />
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height: "100vh" }}
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
                <MemoryForm
                  onSave={(emotion, text, imageFile, imageWasCleared) =>
                    handleUpdateMemory(
                      memory.id,
                      emotion,
                      text,
                      imageFile,
                      imageWasCleared
                    )
                  }
                  buttonText="更新"
                  initialEmotion={memory.emotion}
                  initialText={memory.text}
                  initialImageUrl={memory.image_url}
                  onCancel={() => setEditingMemory(null)}
                />
              ) : (
                <div className={styles.memoryPopup}>
                  {memory.image_url && (
                    <Image
                      src={memory.image_url}
                      alt={memory.text}
                      className={styles.popupImage}
                      width={150}
                      height={120}
                    />
                  )}
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
