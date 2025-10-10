"use client";

import type { Session } from "@supabase/auth-helpers-nextjs";
import { useState, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import styles from "./Map.module.css";
import Header from "../Header";
import MemoryForm from "../MemoryForm";

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
  const [memories, setMemories] = useState<Memory[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [newMemoryLocation, setNewMemoryLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

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
          latitude: newMemoryLocation.lat,
          longitude: newMemoryLocation.lng,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("保存失敗: " + error.message);
    } else if (data) {
      setMemories([...memories, data]);
      setNewMemoryLocation(null);
      alert("思い出を記録しました！");
    }
  };

  return (
    <>
      <Header session={session} />
      <Map
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        initialViewState={{
          longitude: 139.6917,
          latitude: 35.6895,
          zoom: 12,
        }}
        style={{ width: "100vw", height: "100vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onClick={handleMapClick}
      >
        {memories.map((memory) => (
          <Marker
            key={memory.id}
            longitude={memory.longitude}
            latitude={memory.latitude}
          >
            <div
              className={styles.memoryMarker}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMemory(memory);
              }}
            >
              📍
            </div>
          </Marker>
        ))}

        {selectedMemory && (
          <Popup
            longitude={selectedMemory.longitude}
            latitude={selectedMemory.latitude}
            onClose={() => setSelectedMemory(null)}
            anchor="top"
          >
            <div className={styles.memoryPopup}>
              {selectedMemory.image_url && (
                <Image
                  src={selectedMemory.image_url}
                  alt={selectedMemory.text}
                  className={styles.popupImage}
                  width={150}
                  height={120}
                />
              )}
              <span className={styles.emotion}>{selectedMemory.emotion}</span>
              <p>{selectedMemory.text}</p>
            </div>
          </Popup>
        )}

        {newMemoryLocation && (
          <Popup
            longitude={newMemoryLocation.lng}
            latitude={newMemoryLocation.lat}
            onClose={() => setNewMemoryLocation(null)}
            anchor="bottom"
          >
            <MemoryForm onSave={handleSaveMemory} buttonText="記録する" />
          </Popup>
        )}
      </Map>
    </>
  );
}
