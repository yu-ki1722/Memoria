"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Session } from "@supabase/auth-helpers-nextjs";

export default function MapLoader({ session }: { session: Session }) {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    []
  );

  return <Map session={session} />;
}
