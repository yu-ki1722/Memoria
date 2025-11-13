"use client";

import clsx from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary" | "danger" | "success" | "gradient";
};

export default function Button({
  children,
  variant,
  className,
  ...props
}: Props) {
  const baseStyle =
    "flex-grow px-4 py-2 font-bold transition-colors disabled:opacity-50";

  const variantStyles = {
    primary: "bg-memoria-primary text-white hover:bg-memoria-primary-dark",
    secondary:
      "bg-white text-memoria-text border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-memoria-secondary text-white hover:bg-memoria-secondary-dark",
    gradient: "text-white",
  };

  return (
    <button
      className={clsx(baseStyle, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
