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

// Leafletのデフォルトアイコンが正しく表示されない問題の修正
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

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

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [newPosition]);

  const handleSaveMemory = async (emotion: string, text: string) => {
    if (!newPosition) return;

    const { data, error } = await supabase.from("memories").insert([
      {
        emotion: emotion,
        text: text,
        latitude: newPosition.lat,
        longitude: newPosition.lng,
      },
    ]);

    if (error) {
      alert("エラーが発生しました：" + error.message);
    } else {
      alert("思い出を記録しました！");
      console.log("保存されたデータ:", data);
      setNewPosition(null);
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

      {newPosition && (
        <Marker position={newPosition}>
          <Popup>
            <MemoryForm onSave={handleSaveMemory} />
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
