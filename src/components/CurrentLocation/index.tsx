"use client";

import { useMap } from "react-leaflet";
import styles from "./CurrentLocation.module.css";

export default function CurrentLocation() {
  const map = useMap();

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.flyTo([latitude, longitude], 15);
        },
        () => {
          alert("現在地の取得に失敗しました。");
        }
      );
    } else {
      alert("お使いのブラウザは現在地取得機能に対応していません。");
    }
  };

  return (
    <button
      onClick={handleGetCurrentLocation}
      className={styles.locationButton}
    >
      現在地
    </button>
  );
}
