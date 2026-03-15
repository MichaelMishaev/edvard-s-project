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
    <div className={`h-3 w-full rounded-full bg-[#1e2a45] ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-primary to-blue-light"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
