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
    "group relative overflow-hidden flex items-center justify-center gap-3 rounded-2xl px-8 py-4 min-h-[56px] text-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

  const variants = {
    primary:
      "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] border border-white/10 hover:border-white/20",
    secondary:
      "bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] text-white backdrop-blur-xl shadow-lg hover:border-white/20",
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...(props as any)}
    >
      {/* Shine effect overlay */}
      {variant === "primary" && !props.disabled && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full z-0" />
      )}

      <span className="relative z-10 drop-shadow-md">{children}</span>
      {icon && <span className="relative z-10 flex items-center drop-shadow-md transition-transform duration-300 group-hover:scale-110" aria-hidden="true">{icon}</span>}
    </motion.button>
  );
}
