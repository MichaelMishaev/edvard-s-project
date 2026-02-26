import { motion, AnimatePresence } from "framer-motion";

interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-bg-card border border-border-card px-4 py-2">
      <AnimatePresence mode="wait">
        <motion.span
          key={score}
          initial={{ scale: 1.3, color: "#22c55e" }}
          animate={{ scale: 1, color: "#ffffff" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-lg font-bold"
        >
          {score.toLocaleString()}
        </motion.span>
      </AnimatePresence>
      <motion.svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        className="text-blue-primary"
        animate={score > 0 ? { rotate: [0, 15, -15, 0] } : {}}
        transition={{ duration: 0.5 }}
        aria-hidden="true"
      >
        <path
          d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
          fill="currentColor"
        />
      </motion.svg>
    </div>
  );
}
