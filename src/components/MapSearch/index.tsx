"use client";

import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";
import "leaflet-geosearch/dist/geosearch.css";

export default function MapSearch() {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    // 次の行のエラーを意図的に無効にするコメント
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchControl = new (GeoSearchControl as any)({
      provider: provider,
      style: "bar",
      showMarker: true,
      marker: {
        draggable: false,
      },
    });

    map.addControl(searchControl);
    return () => {
      map.removeControl(searchControl);
    };
  }, [map]);

  return null;
}
