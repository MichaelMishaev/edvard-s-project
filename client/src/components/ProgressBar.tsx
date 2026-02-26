import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export default function ProgressBar({
  current,
  total,
  className = "",
}: ProgressBarProps) {
  const percent = (current / total) * 100;

  return (
    <div className={`h-2 w-full rounded-full bg-border-card ${className}`}>
      <motion.div
        className="h-full rounded-full bg-blue-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
