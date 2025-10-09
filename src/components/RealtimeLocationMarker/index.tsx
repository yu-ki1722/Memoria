"use client";

import { useState, useEffect } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import styles from "./RealtimeLocationMarker.module.css";

export default function RealtimeLocationMarker() {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
        setPosition(newPos);
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
  }, [map]);

  const locationIcon = L.divIcon({
    className: styles.locationMarker,
    iconSize: [20, 20],
  });

  return position === null ? null : (
    <Marker position={position} icon={locationIcon}>
      <Popup>現在地</Popup>
    </Marker>
  );
}
