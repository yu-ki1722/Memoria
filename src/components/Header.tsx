"use client";

import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

type HeaderProps = {
  session: Session | null;
};

export default function Header({ session }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="absolute top-0 left-0 w-full z-10 flex justify-between items-center p-4 bg-memoria-background/80 backdrop-blur-sm shadow-sm">
      <h1 className="text-2xl font-bold text-memoria-text">Memoria</h1>
      <nav>
        {session && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-memoria-secondary text-white font-semibold rounded-lg hover:bg-opacity-80 transition-colors"
          >
            ログアウト
          </button>
        )}
      </nav>
    </header>
  );
}
