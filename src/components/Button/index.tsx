"use client";

import styles from "./Button.module.css";

type ButtonProps = {
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
};

export default function Button({
  onClick,
  children,
  variant = "primary",
  type = "button",
}: ButtonProps) {
  const variantClass = {
    primary: styles.primary,
    secondary: styles.secondary,
    danger: styles.danger,
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${styles.button} ${variantClass}`}
    >
      {children}
    </button>
  );
}
