"use client";

import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LeafletMouseEvent } from "leaflet";

// Leafletのデフォルトアイコンが正しく表示されない問題の修正
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// マップクリックを検知
function LocationMarker({
  setNewPosition,
}: {
  setNewPosition: (position: L.LatLng) => void;
}) {
  useMapEvents({
    click(e: LeafletMouseEvent) {
      // クリック位置の座標をセット
      setNewPosition(e.latlng);
    },
  });

  return null;
}

export default function Map() {
  const initialPosition: [number, number] = [35.6895, 139.6917];

  // 新しいピンの位置を保持
  const [newPosition, setNewPosition] = useState<L.LatLng | null>(null);

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

      {/* マップクリック検知コンポーネントを呼び出し */}
      <LocationMarker setNewPosition={setNewPosition} />

      {/* 新しいピンの位置が存在した場合、その場所にマーカーを表示 */}
      {newPosition && (
        <Marker position={newPosition}>
          <Popup>新しい思い出の場所</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
