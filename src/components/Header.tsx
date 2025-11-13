"use client";

import { ReactNode } from "react";

type HeaderProps = {
  title: string;
  rightActions?: ReactNode;
};

export default function Header({ title, rightActions }: HeaderProps) {
  return (
    <header
      className="
        fixed top-0 left-0 w-full z-[1200]
        flex items-center justify-between
        px-5 py-3 bg-memoria-background/80 backdrop-blur-sm shadow-sm
        border-b border-gray-200
      "
      style={{
        height: "64px",
      }}
    >
      <h1 className="text-xl font-semibold text-memoria-text">{title}</h1>

      <div className="flex items-center gap-3">{rightActions}</div>
    </header>
  );
}
