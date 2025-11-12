"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function WelcomePage() {
  const router = useRouter();
  const [particles, setParticles] = useState<
    {
      id: number;
      size: number;
      x: number;
      y: number;
      duration: number;
      delay: number;
      color: string;
    }[]
  >([]);
  const [cloudOpacity, setCloudOpacity] = useState(1);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const colors = [
      "rgba(255,255,255,0.9)",
      "rgba(255,220,180,0.8)",
      "rgba(200,240,255,0.8)",
      "rgba(255,200,230,0.85)",
    ];

    const newParticles = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 10 + 6,
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setCloudOpacity(0);
    }, 1000);

    setTimeout(() => {
      setShowContent(true);
    }, 2500);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#fffdf8] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff8e1] via-[#ffe6f0] to-[#e1f5fe] z-0" />

      <motion.div
        className="absolute w-[480px] h-[480px] bg-yellow-200/70 rounded-full blur-[120px] mix-blend-screen z-10"
        animate={{
          x: [0, 60, -60, 0],
          y: [0, -50, 50, 0],
          opacity: [0.4, 0.8, 0.5, 0.7],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[520px] h-[520px] bg-pink-300/50 rounded-full blur-[150px] mix-blend-screen z-10"
        animate={{
          x: [0, -50, 50, 0],
          y: [0, 40, -30, 0],
          opacity: [0.3, 0.7, 0.4, 0.8],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-[600px] h-[600px] bg-blue-200/50 rounded-full blur-[180px] mix-blend-screen z-10"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 60, 0],
          opacity: [0.4, 0.6, 0.5, 0.7],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full mix-blend-screen z-20"
          style={{
            width: p.size,
            height: p.size,
            left: `${50 + p.x}%`,
            top: `${50 + p.y}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            filter: "blur(2px)",
          }}
          animate={{
            x: [0, Math.random() * 200 - 100],
            y: [0, Math.random() * 200 - 100],
            opacity: [0.3, 1, 0.6, 0.9],
            scale: [1, 1.4, 0.8, 1],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 bg-white z-30 blur-[80px]"
        animate={{ opacity: cloudOpacity }}
        transition={{ duration: 2.5, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-40 flex flex-col items-center text-center px-6"
        initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
        animate={
          showContent
            ? { opacity: 1, y: 0, filter: "blur(0px)" }
            : { opacity: 0, y: 40, filter: "blur(12px)" }
        }
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-[Caveat] text-gray-800 mb-2 tracking-wide">
          Memoria
        </h1>
        <p className="text-gray-600 text-base leading-relaxed max-w-sm mb-10">
          あなたの記憶が、世界に灯る。
          <br />
          思い出を地図に描こう。
        </p>
        <motion.button
          onClick={() => router.push("/login")}
          className="px-8 py-3 bg-gradient-to-r from-[#86c8b2] to-[#74b5a1] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          whileTap={{ scale: 0.95 }}
        >
          地図を作成する
        </motion.button>
      </motion.div>

      <p className="absolute bottom-6 text-xs text-gray-400 z-40">
        © 2025 Memoria
      </p>
    </div>
  );
}
