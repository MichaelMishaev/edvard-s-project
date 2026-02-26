const PROFANE_WORDS: string[] = [
  "זונה",
  "שרמוטה",
  "כוס",
  "זין",
  "תחת",
  "חרא",
  "מניאק",
  "אידיוט",
  "טמבל",
  "מטומטם",
  "דביל",
  "חמור",
  "בהמה",
  "מפגר",
  "טיפש",
  "יא קל",
  "בן זונה",
  "fuck",
  "shit",
  "ass",
  "damn",
  "bitch",
  "stupid",
  "idiot",
];

export function isProfane(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return PROFANE_WORDS.some(
    (word) =>
      normalized.includes(word) || normalized.includes(word.replace(/\s/g, ""))
  );
}
