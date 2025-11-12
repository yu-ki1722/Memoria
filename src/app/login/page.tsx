"use client";

import { supabase } from "@/lib/supabaseClient";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/map");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#fffdf8] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff8e1] via-[#ffe6f0] to-[#e1f5fe] z-0" />

      <motion.div
        className="absolute w-72 h-72 bg-pink-200/40 rounded-full blur-[80px] mix-blend-screen"
        animate={{
          x: [0, 40, -40, 0],
          y: [0, -30, 30, 0],
          opacity: [0.3, 0.6, 0.4, 0.5],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 bg-blue-200/40 rounded-full blur-[120px] mix-blend-screen"
        animate={{
          x: [0, -50, 50, 0],
          y: [0, 20, -20, 0],
          opacity: [0.2, 0.5, 0.3, 0.4],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="
          relative z-20 p-8 w-[360px]
          bg-white/35 backdrop-blur-xl 
          rounded-3xl shadow-lg 
          border border-white/40
        "
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        <h2 className="text-center text-2xl font-semibold text-gray-700 mb-6">
          ログイン
        </h2>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "#86c8b2",
                  brandAccent: "#74b5a1",
                },
                radii: {
                  borderRadiusButton: "9999px",
                  inputBorderRadius: "12px",
                },
              },
            },
            style: {
              button: { borderRadius: "9999px" },
              input: { borderRadius: "12px" },
            },
          }}
          providers={["github", "google"]}
        />

        <p className="text-center text-gray-400 text-xs mt-6">© 2025 Memoria</p>
      </motion.div>
    </div>
  );
}
