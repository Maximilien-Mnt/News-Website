import { describe, it, expect } from "vitest";
import { levelOf, LEVEL_LABELS, type ImportanceLevel } from "./levels";

describe("levels", () => {
  const cases: Array<{ importance: number; expected: ImportanceLevel }> = [
    { importance: 100, expected: "flash" },
    { importance: 85, expected: "flash" },
    { importance: 84, expected: "high" },
    { importance: 70, expected: "high" },
    { importance: 65, expected: "high" },
    { importance: 64, expected: "mid" },
    { importance: 50, expected: "mid" },
    { importance: 40, expected: "mid" },
    { importance: 39, expected: "low" },
    { importance: 0, expected: "low" },
  ];

  it("should map importance scores to levels", () => {
    for (const { importance, expected } of cases) {
      expect(levelOf(importance)).toBe(expected);
    }
  });

  it("should have correct label mappings", () => {
    expect(LEVEL_LABELS.flash).toBe("Essentiel");
    expect(LEVEL_LABELS.high).toBe("Important");
    expect(LEVEL_LABELS.mid).toBe("À suivre");
    expect(LEVEL_LABELS.low).toBe("En bref");
  });

  it("should be a valid importance level", () => {
    const validLevels: ImportanceLevel[] = ["flash", "high", "mid", "low"];
    expect(["flash", "high", "mid", "low"]).toContain(levelOf(100));
    expect(["flash", "high", "mid", "low"]).toContain(levelOf(0));
  });
});