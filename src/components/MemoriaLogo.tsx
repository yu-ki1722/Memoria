"use client";

import { Baloo_2 } from "next/font/google";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: "700",
});

export default function MemoriaLogo({ className = "" }) {
  return (
    <div
      className={`
        ${baloo.className}
        text-3xl md:text-4xl font-extrabold tracking-wide select-none
        text-transparent bg-clip-text
        bg-gradient-to-r
        from-[#F7B8D8] via-[#AFC8FF] to-[#B8F5E0]
        drop-shadow-[0_0_14px_rgba(255,255,255,0.65)]
        drop-shadow-[0_0_28px_rgba(255,255,255,0.55)]
        ${className}
      `}
    >
      Memoria
    </div>
  );
}
