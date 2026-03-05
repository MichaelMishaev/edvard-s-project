/**
 * Validation state icon component
 * Shows checkmark (valid) or X (invalid) based on state
 */

import { motion, AnimatePresence } from "framer-motion";

export type ValidationState = "idle" | "valid" | "invalid";

interface ValidationIconProps {
  state: ValidationState;
}

export default function ValidationIcon({ state }: ValidationIconProps) {
  if (state === "idle") return null;

  return (
    <AnimatePresence mode="wait">
      {state === "valid" && (
        <motion.div
          key="valid"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center"
          aria-label="תקין"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-400"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </motion.div>
      )}
      {state === "invalid" && (
        <motion.div
          key="invalid"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex items-center justify-center"
          aria-label="שגוי"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-red-300"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
