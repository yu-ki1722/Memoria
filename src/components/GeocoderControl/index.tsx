"use client";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { useControl } from "react-map-gl/mapbox";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

type GeocoderControlProps = {
  mapboxAccessToken: string;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

export default function GeocoderControl({
  mapboxAccessToken,
  position,
}: GeocoderControlProps) {
  useControl(
    () => {
      const ctrl = new MapboxGeocoder({
        accessToken: mapboxAccessToken,
        marker: false,
        collapsed: true,
      });
      return ctrl;
    },
    {
      position: position,
    }
  );

  return null;
}
