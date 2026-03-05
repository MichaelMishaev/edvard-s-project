/**
 * Character counter component for text inputs
 * Shows current/max with color coding based on usage
 */

interface CharacterCounterProps {
  current: number;
  max: number;
  isError?: boolean;
}

export default function CharacterCounter({
  current,
  max,
  isError = false,
}: CharacterCounterProps) {
  // Color coding based on character usage
  const getColor = () => {
    if (isError) return "text-red-300";
    if (current >= max) return "text-red-300";
    if (current >= max * 0.9) return "text-yellow-400";
    return "text-text-secondary";
  };

  return (
    <span
      className={`text-base font-medium transition-colors duration-200 ${getColor()}`}
      aria-live="polite"
      aria-atomic="true"
    >
      {current}/{max}
    </span>
  );
}
