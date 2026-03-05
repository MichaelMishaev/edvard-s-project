/**
 * Form validation utilities for Jerusalem Quest
 * Centralized validation logic with debouncing support
 */

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates player name according to game rules
 * - Must not be empty
 * - Max 15 characters
 * - No special characters (only Hebrew, English, numbers, spaces)
 */
export function validateName(value: string): ValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, error: "יש להזין שם" };
  }

  if (trimmed.length > 15) {
    return { isValid: false, error: "השם ארוך מדי (עד 15 תווים)" };
  }

  if (/[^a-zA-Zא-ת0-9\s]/.test(trimmed)) {
    return { isValid: false, error: "אין להשתמש בתווים מיוחדים" };
  }

  return { isValid: true, error: null };
}

/**
 * Validates class selection
 * - Must not be empty
 */
export function validateClass(value: string): ValidationResult {
  const trimmed = value.trim();

  if (!trimmed) {
    return { isValid: false, error: "יש לבחור כיתה" };
  }

  return { isValid: true, error: null };
}

/**
 * Debounce helper for validation
 * Delays validation until user stops typing for specified duration
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
