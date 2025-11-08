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
        fixed top-0 left-0 w-full z-20 flex items-center justify-between 
        px-6 py-3 bg-memoria-background/80 backdrop-blur-sm shadow-sm
        transition-all max-sm:px-3 max-sm:py-2
      "
    >
      <h1
        className="
          text-2xl font-bold text-memoria-text 
          max-sm:text-lg max-sm:font-semibold
        "
      >
        {title}
      </h1>

      <div className="flex items-center gap-3">{rightActions}</div>
    </header>
  );
}
