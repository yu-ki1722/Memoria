import { useState, useEffect } from "react";
import { Marker } from "react-map-gl/mapbox";

export default function RealtimeLocationMarker() {
  const [position, setPosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        console.error("現在地取得エラー:", err);
      },
      {
        enableHighAccuracy: true,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return position === null ? null : (
    <Marker longitude={position.longitude} latitude={position.latitude}>
      <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-lg" />
    </Marker>
  );
}
