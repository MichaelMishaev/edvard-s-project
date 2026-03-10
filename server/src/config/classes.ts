export const CLASSES = [
  { id: "dalet1", label: "ד׳1" },
  { id: "dalet2", label: "ד׳2" },
  { id: "dalet3", label: "ד׳3" },
  { id: "dalet4", label: "ד׳4" },
  { id: "heh1", label: "ה׳1" },
  { id: "heh2", label: "ה׳2" },
  { id: "heh3", label: "ה׳3" },
  { id: "heh4", label: "ה׳4" },
  { id: "vav1", label: "ו׳1" },
  { id: "vav2", label: "ו׳2" },
  { id: "vav3", label: "ו׳3" },
  { id: "vav4", label: "ו׳4" },
] as const;

export type ClassId = (typeof CLASSES)[number]["id"];

export const isValidClass = (className: string): className is ClassId => {
  return CLASSES.some((c) => c.id === className);
};
