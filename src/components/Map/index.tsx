"use client";

import type { Session } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect, useRef } from "react";
import Map, { Marker, Popup, MapRef } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import styles from "./Map.module.css";
import Header from "../Header";
import MemoryForm from "../MemoryForm";
import Button from "../Button";
import GeocoderControl from "../GeocoderControl";
import CurrentLocationButton from "../CurrentLocationButton";
import RealtimeLocationMarker from "../RealtimeLocationMarker";
import MemoryPinIcon from "../MemoryPinIcon";

const emotionStyles = {
  "😊": { bg: "bg-emotion-happy", shadow: "shadow-glow-happy" },
  "😂": { bg: "bg-emotion-laugh", shadow: "shadow-glow-laugh" },
  "😍": { bg: "bg-emotion-love", shadow: "shadow-glow-love" },
  "😢": { bg: "bg-emotion-sad", shadow: "shadow-glow-sad" },
  "😮": { bg: "bg-emotion-surprise", shadow: "shadow-glow-surprise" },
  "🤔": { bg: "bg-emotion-thinking", shadow: "shadow-glow-thinking" },
} as const;

const emotionGradientColors = {
  "😊": { start: "#FFD18E", end: "#FFA07A" },
  "😂": { start: "#ffff7aff", end: "#efffb6ff" },
  "😍": { start: "#FFB6C1", end: "#FF69B4" },
  "😢": { start: "#ADD8E6", end: "#87CEFA" },
  "😮": { start: "#afeeb0ff", end: "#7fff88ff" },
  "🤔": { start: "#D8BFD8", end: "#BA55D3" },
};

type Emotion = keyof typeof emotionStyles;

type Memory = {
  id: number;
  emotion: string;
  text: string;
  latitude: number;
  longitude: number;
  user_id: string;
  image_url: string | null;
};

export default function MapWrapper({ session }: { session: Session }) {
  console.log("Mapbox Token:", process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemoryLocation, setNewMemoryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [editingMemory, setEditingMemory] = useState<number | null>(null);
  const [initialView, setInitialView] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setInitialView({
          latitude,
          longitude,
          zoom: 15,
        });
      },
      () => {
        console.warn("現在地取得に失敗しました。デフォルト位置を使用します。");
        setInitialView({
          latitude: 35.6895,
          longitude: 139.6917,
          zoom: 12,
        });
      }
    );
  }, []);

  useEffect(() => {
    const fetchMemories = async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", session.user.id);
      if (data) setMemories(data);
    };
    if (session) fetchMemories();
  }, [session]);

  const handleMapClick = (event: MapMouseEvent) => {
    const targetElement = event.originalEvent.target as HTMLElement;
    if (
      targetElement &&
      targetElement.closest(".mapboxgl-marker, .mapboxgl-popup")
    ) {
      return;
    }
    const { lng, lat } = event.lngLat;
    setNewMemoryLocation({ lng, lat });
    setSelectedMemory(null);
  };

  const handleSaveMemory = async (
    emotion: string,
    text: string,
    imageFile: File | null
  ) => {
    if (!newMemoryLocation || !session) return;
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
      if (uploadError)
        return alert("画像アップロード失敗: " + uploadError.message);

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
          latitude: newMemoryLocation.lat,
          longitude: newMemoryLocation.lng,
        },
      ])
      .select()
      .single();

    if (error) return alert("保存失敗: " + error.message);

    setMemories([...memories, data]);
    setNewMemoryLocation(null);
    alert("思い出を記録しました！");
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
      if (uploadError)
        return alert("画像アップロード失敗: " + uploadError.message);
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
      .update({ text, emotion, image_url: finalImageUrl })
      .eq("id", id)
      .select()
      .single();

    if (error) return alert("更新失敗: " + error.message);

    setMemories(memories.map((m) => (m.id === id ? data : m)));
    setEditingMemory(null);
    alert("思い出を更新しました。");
  };

  const handleDeleteMemory = async (id: number) => {
    if (!window.confirm("この思い出を本当に削除しますか？")) return;

    const memoryToDelete = memories.find((memory) => memory.id === id);
    if (memoryToDelete?.image_url) {
      const filePath = memoryToDelete.image_url.split("/").slice(-2).join("/");
      await supabase.storage.from("memory-images").remove([filePath]);
    }

    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) return alert("削除失敗: " + error.message);

    setMemories(memories.filter((memory) => memory.id !== id));
    setSelectedMemory(null);
    alert("思い出を削除しました。");
  };

  return (
    <>
      <Header session={session} />
      <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
        {isLocating && (
          <div className="absolute top-0 left-0 w-full h-full z-[1001] flex justify-center items-center bg-black/50 text-white text-lg font-bold">
            <p>現在地を取得中...</p>
          </div>
        )}
        {!initialView ? (
          <p className="absolute top-0 left-0 w-full h-full z-[1001] flex justify-center items-center bg-black/50 text-white text-lg font-bold">
            現在地を取得中...
          </p>
        ) : (
          <Map
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            ref={mapRef}
            initialViewState={initialView}
            style={{ width: "100%", height: "100%" }}
            mapStyle="mapbox://styles/mapbox/streets-v12"
            onClick={handleMapClick}
          >
            <GeocoderControl
              mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
              position="bottom-left"
            />
            <RealtimeLocationMarker />
            {memories.map((memory) => {
              const colors = emotionGradientColors[
                memory.emotion as Emotion
              ] || { start: "#CCCCCC", end: "#999999" };

              return (
                <Marker
                  key={`memory-${memory.id}`}
                  longitude={memory.longitude}
                  latitude={memory.latitude}
                  anchor="bottom"
                >
                  <div
                    className="w-10 h-10 cursor-pointer transition-transform hover:scale-110"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingMemory(null);
                      setSelectedMemory(memory);
                    }}
                  >
                    <MemoryPinIcon
                      startColor={colors.start}
                      endColor={colors.end}
                    />
                  </div>
                </Marker>
              );
            })}

            {selectedMemory && !editingMemory && (
              <Popup
                longitude={selectedMemory.longitude}
                latitude={selectedMemory.latitude}
                onClose={() => setSelectedMemory(null)}
                anchor="bottom"
                className="memoria-popup"
              >
                {(() => {
                  const emotionKey = selectedMemory.emotion as Emotion;
                  const style = emotionStyles[emotionKey] || null;
                  return (
                    <div
                      className={`w-56 flex flex-col gap-2 rounded-lg animate-softAppear ${style.bg} ${style.shadow} p-4 pt-8 mt-4`}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div
                          className={`w-12 h-12 rounded-full text-3xl flex items-center justify-center ${style.bg} ${style.shadow}`}
                        >
                          {selectedMemory.emotion}
                        </div>
                      </div>

                      {selectedMemory.image_url && (
                        <Image
                          src={selectedMemory.image_url}
                          alt={selectedMemory.text}
                          width={200}
                          height={150}
                          className="rounded-md object-cover w-full"
                        />
                      )}
                      <p className="text-gray-700 text-sm">
                        {selectedMemory.text}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="primary"
                          onClick={() => {
                            setEditingMemory(selectedMemory.id);
                            setSelectedMemory(null);
                          }}
                        >
                          編集
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteMemory(selectedMemory.id)}
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </Popup>
            )}

            {editingMemory &&
              (() => {
                const memoryToEdit = memories.find(
                  (m) => m.id === editingMemory
                );
                if (!memoryToEdit) return null;
                return (
                  <Popup
                    longitude={memoryToEdit.longitude}
                    latitude={memoryToEdit.latitude}
                    onClose={() => setEditingMemory(null)}
                    anchor="bottom"
                    className="memoria-popup"
                    data-emotion={memoryToEdit.emotion}
                  >
                    <MemoryForm
                      onSave={(emotion, text, imageFile, imageWasCleared) =>
                        handleUpdateMemory(
                          memoryToEdit.id,
                          emotion,
                          text,
                          imageFile,
                          imageWasCleared
                        )
                      }
                      buttonText="更新"
                      initialEmotion={memoryToEdit.emotion}
                      initialText={memoryToEdit.text}
                      initialImageUrl={memoryToEdit.image_url}
                      onCancel={() => setEditingMemory(null)}
                    />
                  </Popup>
                );
              })()}

            {newMemoryLocation && (
              <Popup
                longitude={newMemoryLocation.lng}
                latitude={newMemoryLocation.lat}
                onClose={() => setNewMemoryLocation(null)}
                anchor="bottom"
                className="memoria-popup"
              >
                <MemoryForm onSave={handleSaveMemory} buttonText="記録する" />
              </Popup>
            )}
          </Map>
        )}
        <CurrentLocationButton mapRef={mapRef} setIsLocating={setIsLocating} />
      </div>
    </>
  );
}
