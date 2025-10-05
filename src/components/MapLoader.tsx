"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapLoader() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>地図を読み込んでいます...</p>,
        ssr: false,
      }),
    []
  );

  return <Map />;
}
