import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClassSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

type GradeLevel = "dalet" | "heh" | "vav";

const GRADES = [
  { id: "dalet" as GradeLevel, label: 'כיתה ד׳', emoji: "🌱", color: "#22c55e" },
  { id: "heh" as GradeLevel, label: 'כיתה ה׳', emoji: "🌿", color: "#3b82f6" },
  { id: "vav" as GradeLevel, label: 'כיתה ו׳', emoji: "🌳", color: "#8b5cf6" },
];

const CLASS_NUMBERS = [
  { id: "1", label: "כיתה 1", number: "1" },
  { id: "2", label: "כיתה 2", number: "2" },
  { id: "3", label: "כיתה 3", number: "3" },
  { id: "4", label: "כיתה 4", number: "4" },
];

export default function ClassSelector({ value, onChange, error }: ClassSelectorProps) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | null>(() => {
    if (value.startsWith("dalet")) return "dalet";
    if (value.startsWith("heh")) return "heh";
    if (value.startsWith("vav")) return "vav";
    return null;
  });

  const handleGradeSelect = (grade: GradeLevel) => {
    setSelectedGrade(grade);
    // Don't set the final value yet - wait for class number selection
  };

  const handleClassNumberSelect = (number: string) => {
    if (!selectedGrade) return;
    const fullValue = `${selectedGrade}${number}`;
    onChange(fullValue);
  };

  const selectedGradeData = GRADES.find(g => g.id === selectedGrade);

  return (
    <div className="space-y-4">
      {/* Step 1: Select Grade Level */}
      <div>
        <p className="mb-3 text-right text-base font-medium text-white">
          :בחר את השכבה שלך
        </p>
        <div className="grid grid-cols-3 gap-3">
          {GRADES.map((grade) => {
            const isSelected = selectedGrade === grade.id;
            return (
              <motion.button
                key={grade.id}
                type="button"
                onClick={() => handleGradeSelect(grade.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative flex min-h-[80px] flex-col items-center justify-center gap-1
                  rounded-xl border-2 p-3 font-bold transition-all duration-200
                  ${
                    isSelected
                      ? "border-white bg-white/20 shadow-lg"
                      : "border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10"
                  }
                  ${error && !selectedGrade ? "animate-pulse border-red-400" : ""}
                `}
                style={{
                  boxShadow: isSelected ? `0 0 20px ${grade.color}40` : undefined,
                }}
                aria-pressed={isSelected}
              >
                <span className="text-2xl" aria-hidden="true">{grade.emoji}</span>
                <span className="text-sm text-white">{grade.label}</span>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Select Class Number (only shown after grade selection) */}
      <AnimatePresence mode="wait">
        {selectedGrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="mb-3 text-right text-base font-medium text-white">
              :בחר את מספר הכיתה
            </p>
            <div className="grid grid-cols-4 gap-3">
              {CLASS_NUMBERS.map((classNum) => {
                const fullValue = `${selectedGrade}${classNum.id}`;
                const isSelected = value === fullValue;
                return (
                  <motion.button
                    key={classNum.id}
                    type="button"
                    onClick={() => handleClassNumberSelect(classNum.id)}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * parseInt(classNum.id) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      relative flex min-h-[70px] flex-col items-center justify-center
                      rounded-xl border-2 p-3 font-bold transition-all duration-200
                      ${
                        isSelected
                          ? "border-white bg-white/20 shadow-lg"
                          : "border-white/30 bg-white/5 hover:border-white/50 hover:bg-white/10"
                      }
                      ${error && !value ? "animate-pulse border-red-400" : ""}
                    `}
                    style={{
                      boxShadow: isSelected ? `0 0 20px ${selectedGradeData?.color}40` : undefined,
                    }}
                    aria-pressed={isSelected}
                  >
                    <span className="text-3xl text-white">{classNum.number}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-green-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected value display */}
      {value && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 rounded-lg bg-green-900/30 px-4 py-2"
        >
          <span className="text-sm font-medium text-green-300">
            {selectedGradeData?.label} - כיתה {value.slice(-1)}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-400"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}
