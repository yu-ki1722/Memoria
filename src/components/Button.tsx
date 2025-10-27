"use client";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary" | "danger" | "success";
};

export default function Button({ children, variant, ...props }: Props) {
  const baseStyle =
    "flex-grow px-4 py-2 rounded-md font-bold transition-colors disabled:opacity-50";

  const variantStyles = {
    primary: "bg-memoria-primary text-white hover:bg-opacity-80",
    secondary:
      "bg-white text-memoria-text border border-gray-300 hover:bg-gray-50",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-memoria-secondary text-white hover:bg-opacity-80",
  };

  return (
    <button className={`${baseStyle} ${variantStyles[variant]}`} {...props}>
      {children}
    </button>
  );
}
