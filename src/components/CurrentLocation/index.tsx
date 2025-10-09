"use client";

import { useMap } from "react-leaflet";
import styles from "./CurrentLocation.module.css";
import { useEffect, useRef } from "react";
import L from "leaflet";

export default function CurrentLocation() {
  const map = useMap();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (button) {
      L.DomEvent.on(button, "mousedown dblclick", L.DomEvent.stopPropagation);
    }
  }, []);

  const handleClick = () => {
    map
      .locate()
      .on("locationfound", (e) => {
        map.flyTo(e.latlng, 16);
      })
      .on("locationerror", () => {
        alert("現在地の取得に失敗しました。");
      });
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`${styles.button} leaflet-control`}
    >
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
      </svg>
    </button>
  );
}
