import { motion } from "framer-motion";
import type { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  children,
  icon,
  fullWidth = true,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "flex items-center justify-center gap-3 rounded-full px-8 py-4 text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-blue-primary hover:bg-blue-dark text-white",
    secondary:
      "bg-bg-card border border-border-card hover:bg-bg-card-hover text-text-secondary",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...(props as any)}
    >
      {children}
      {icon && <span className="flex items-center">{icon}</span>}
    </motion.button>
  );
}
