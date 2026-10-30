import { describe, it, expect } from "vitest";
import { frTypo } from "./frTypo";

describe("frTypo", () => {
  it("should add non-breaking space before : when absent", () => {
    expect(frTypo("Il dict: oui")).toContain("\u00A0:");
  });

  it("should add non-breaking space before ; when absent", () => {
    expect(frTypo("Il dit; oui")).toContain("\u00A0;");
  });

  it("should add non-breaking space before ! when absent", () => {
    expect(frTypo("Wow!")).toContain("\u00A0!");
  });

  it("should add non-breaking space before ? when absent", () => {
    expect(frTypo("Qui?")).toContain("\u00A0?");
  });

  it("should add non-breaking space before » when absent", () => {
    expect(frTypo("Texte»")).toContain("\u00A0»");
  });

  it("should add non-breaking space after « when absent", () => {
    expect(frTypo("«texte")).toMatch(/«\u00A0/);
  });

  it("should replace ... with typographic ellipsis", () => {
    expect(frTypo("C'est ...")).toContain("\u2026");
  });

  it("should not modify text without special cases", () => {
    expect(frTypo("Normal text")).toBe("Normal text");
  });
});