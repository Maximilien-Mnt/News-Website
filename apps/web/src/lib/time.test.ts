import { describe, it, expect } from "vitest";
import { relativeTime, absoluteTime, groupLabel, formatTime } from "./time";

const baseDate = new Date(Date.UTC(2026, 9, 30, 18, 42)); // 30 sept. 2026 18:42 UTC

describe("time", () => {
  it("should format a time correctly (uses local time, may vary by system)", () => {
    // On vérifie seulement que la fonction ne plane pas;
    // le fuseau dépend du système d'exécution.
    expect(formatTime(baseDate)).toMatch(/\d{2}:\d{2}/);
  });

  describe("relativeTime", () => {
    it("should return 'à l'instant' for < 1 min", () => {
      const date59s = new Date(baseDate.getTime() - 59_000);
      expect(relativeTime(date59s, baseDate)).toBe("à l'instant");
    });

    it("should return 'il y a 12 min' for 12 min ago", () => {
      const date = new Date(baseDate.getTime() - 12 * 60_000);
      expect(relativeTime(date, baseDate)).toBe("il y a 12 min");
    });

    it("should return 'il y a 3 h' for 3 h ago", () => {
      const date = new Date(baseDate.getTime() - 3 * 60_000 * 60);
      expect(relativeTime(date, baseDate)).toBe("il y a 3 h");
    });

    it("should return 'il y a 1 min' for 1 min ago", () => {
      const date = new Date(baseDate.getTime() - 60_000);
      expect(relativeTime(date, baseDate)).toBe("il y a 1 min");
    });

    it("should return 'dans 1 min' for 1 min in the future", () => {
      const date = new Date(baseDate.getTime() + 60_000);
      expect(relativeTime(date, baseDate)).toBe("dans 1 min");
    });
  });

  describe("absoluteTime", () => {
    it("should return relative label when less than 1 day ago", () => {
      // avec now = baseDate, hier donne "hier" en groupe mais absoluteTime
      // dépend du fuseau ; on teste juste qu'il ne plante pas.
      const yesterday = new Date(baseDate.getTime() - 86_400_000);
      expect(absoluteTime(yesterday, baseDate)).toMatch(/hier/);
    });

    it("should return weekday+date for < 7 days ago", () => {
      const tuesday = new Date(baseDate.getTime() - 3 * 86_400_000);
      expect(absoluteTime(tuesday, baseDate)).toMatch(/27 oct./);
    });

    it("should return date+year for older than 7 days", () => {
      const twoWeeksAgo = new Date(baseDate.getTime() - 14 * 86_400_000);
      expect(absoluteTime(twoWeeksAgo, baseDate)).toMatch(/\\d{1,2} oct\. \\d{4}/);
    });
  });

  describe("groupLabel", () => {
    it("should return 'Dernière heure' for < 60 min", () => {
      const date = new Date(baseDate.getTime() - 30 * 60_000);
      expect(groupLabel(date, baseDate)).toBe("Dernière heure");
    });

    it("should return 'Aujourd'hui' for < 24 h", () => {
      const date = new Date(baseDate.getTime() - 12 * 60_000 * 60);
      expect(groupLabel(date, baseDate)).toBe("Aujourd'hui");
    });

    it("should return 'Hier' for yesterday", () => {
      const yesterday = new Date(baseDate.getTime() - 86_400_000);
      expect(groupLabel(yesterday, baseDate)).toBe("Hier");
    });

    it("should return 'Cette semaine' for < 7 days", () => {
      const date = new Date(baseDate.getTime() - 3 * 86_400_000);
      expect(groupLabel(date, baseDate)).toBe("Cette semaine");
    });

    it("should return 'Plus ancien' for >= 7 days", () => {
      const date = new Date(baseDate.getTime() - 10 * 86_400_000);
      expect(groupLabel(date, baseDate)).toBe("Plus ancien");
    });
  });
});