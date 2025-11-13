"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MapLoader from "@/components/MapLoader";
import type { Session } from "@supabase/auth-helpers-nextjs";
import { supabase } from "@/lib/supabaseClient";

export default function MapPage() {
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/");
      } else {
        setSession(session);
      }
    };
    getSession();
  }, [router]);

  if (!session) {
    return <p>Loading...</p>;
  }

  return <MapLoader session={session} />;
}
