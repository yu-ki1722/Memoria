"use client";

import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/auth-helpers-nextjs";
import styles from "./Header.module.css";
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
    <header className={styles.header}>
      <h1 className={styles.title}>Memoria</h1>
      <nav>
        {session && (
          <button onClick={handleLogout} className={styles.button}>
            ログアウト
          </button>
        )}
      </nav>
    </header>
  );
}
