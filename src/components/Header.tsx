"use client";

import { supabase } from "@/lib/supabaseClient";
import { Session } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

type HeaderProps = {
  session: Session | null;
  onSearchOpen?: () => void;
};

export default function Header({ session, onSearchOpen }: HeaderProps) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userInitial = session?.user?.email
    ? session.user.email[0].toUpperCase()
    : "?";

  return (
    <header
      className="
        absolute top-0 left-0 w-full z-10 flex justify-between items-center p-4
        bg-memoria-background/80 backdrop-blur-sm shadow-sm
        transition-all
        max-sm:fixed max-sm:h-14 max-sm:px-3
        max-sm:bg-memoria-background/90 max-sm:shadow-md
      "
    >
      <div className="hidden max-sm:block">
        <button
          onClick={onSearchOpen}
          className="w-9 h-9 flex items-center justify-center text-memoria-text hover:text-memoria-secondary-dark transition"
        >
          <Search className="w-6 h-6" />
        </button>
      </div>

      <h1
        className="
          text-2xl font-bold text-memoria-text
          max-sm:text-lg max-sm:font-semibold max-sm:text-memoria-text
        "
      >
        Memoria
      </h1>

      <nav>
        {session && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="
                w-10 h-10 rounded-full bg-memoria-secondary text-white 
                flex items-center justify-center font-bold text-lg 
                focus:outline-none focus:ring-2 focus:ring-memoria-secondary-dark
                transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg
                max-sm:w-9 max-sm:h-9 max-sm:text-base
              "
            >
              {userInitial}
            </button>

            {isMenuOpen && (
              <div
                className="
                  absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 
                  animate-softAppear overflow-hidden
                  max-sm:w-48
                "
              >
                <div className="p-4 border-b border-gray-100 bg-gray-50 max-sm:p-3">
                  <p className="text-sm text-memoria-text/70 max-sm:text-xs">
                    ログイン中:
                  </p>
                  <p className="font-semibold text-memoria-text truncate max-sm:text-sm">
                    {session.user.email}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="
                    w-full text-left px-4 py-3 text-memoria-text 
                    hover:bg-memoria-secondary-dark hover:text-white transition-colors
                    max-sm:px-3 max-sm:py-2 max-sm:text-sm
                  "
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
