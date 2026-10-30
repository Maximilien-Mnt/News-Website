/**
 * Niveaux d'importance pour le rail, selon DESIGN-SPEC §6.
 *
 *   85–100  → flash   → "Essentiel"
 *   65–84   → high    → "Important"
 *   40–64   → mid     → "À suivre"
 *   0–39    → low     → "En bref"
 */

export type ImportanceLevel = "flash" | "high" | "mid" | "low";

export const LEVEL_LABELS: Record<ImportanceLevel, string> = {
  flash: "Essentiel",
  high: "Important",
  mid: "À suivre",
  low: "En bref",
};

export function levelOf(importance: number): ImportanceLevel {
  if (importance >= 85) return "flash";
  if (importance >= 65) return "high";
  if (importance >= 40) return "mid";
  return "low";
}
