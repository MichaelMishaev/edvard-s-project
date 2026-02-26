import { motion } from "framer-motion";
import { BADGE_CONFIG } from "../lib/constants";
import {
  StarMedalIcon,
  LightningIcon,
  CompassIcon,
  HistoryStarIcon,
  ParticipationIcon,
} from "./Icons";

interface BadgeProps {
  name: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  delay?: number;
}

const iconMap: Record<string, React.FC<{ size?: number; color?: string }>> = {
  "star-medal": StarMedalIcon,
  lightning: LightningIcon,
  compass: CompassIcon,
  "history-star": HistoryStarIcon,
  participation: ParticipationIcon,
};

export default function Badge({
  name,
  size = "md",
  showLabel = true,
  delay = 0,
}: BadgeProps) {
  const config = BADGE_CONFIG[name];
  if (!config) return null;

  const sizeMap = { sm: 32, md: 64, lg: 80 };
  const iconSize = { sm: 16, md: 28, lg: 36 };
  const px = sizeMap[size];
  const IconComponent = iconMap[config.icon];

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 20 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="flex items-center justify-center rounded-xl"
        style={{
          width: px,
          height: px,
          backgroundColor: config.bgColor,
        }}
      >
        {IconComponent && (
          <IconComponent size={iconSize[size]} color={config.color} />
        )}
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-text-secondary">{name}</span>
      )}
    </motion.div>
  );
}
