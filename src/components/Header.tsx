"use client";

import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

type HeaderProps = {
  session: Session | null;
};

export default function Header({ session }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  const userInitial = session?.user?.email
    ? session.user.email[0].toUpperCase()
    : "?";

  return (
    <header className="absolute top-0 left-0 w-full z-10 flex justify-between items-center p-4 bg-memoria-background/80 backdrop-blur-sm shadow-sm">
      <h1 className="text-2xl font-bold text-memoria-text">Memoria</h1>
      <nav>
        {session && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-10 h-10 rounded-full bg-memoria-secondary text-white flex items-center justify-center font-bold text-lg 
                         focus:outline-none focus:ring-2 focus:ring-memoria-secondary-dark
                         transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg"
            >
              {userInitial}
            </button>

            {isMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 
                           animate-softAppear overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <p className="text-sm text-memoria-text/70">ログイン中:</p>
                  <p className="font-semibold text-memoria-text truncate">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-memoria-text hover:bg-memoria-secondary-dark hover:text-white transition-colors"
                >
                  ログアウト
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
