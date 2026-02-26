import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-border-card bg-bg-card p-4 ${className}`}
    >
      {children}
    </div>
  );
}
