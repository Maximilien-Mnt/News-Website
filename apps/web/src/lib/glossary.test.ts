import { describe, it, expect } from "vitest";
import { splitWithTerms } from "./glossary";

describe("splitWithTerms", () => {
  it("should return plain text when text is empty", () => {
    expect(splitWithTerms("", [])).toEqual([{ type: "text", text: "" }]);
  });

  it("should return plain text when terms array is empty", () => {
    expect(splitWithTerms("Hello world", [])).toEqual([{ type: "text", text: "Hello world" }]);
  });

  it("should ignore terms absent from text (both absent → single text segment)", () => {
    const result = splitWithTerms(
      "C'est une belle journée",
      [
        { surface: "jet stream", term: "jet stream", definition: "..." },
        { surface: "modèle", term: "modèle", definition: "..." },
      ]
    );
    // Both absent → single segment with full text
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ type: "text", text: "C'est une belle journée" });
  });

  it("should be case-insensitive on surface (3 segments: before + term + after)", () => {
    const result = splitWithTerms(
      "Le jet Stream influence le temps",
      [
        { surface: "jet stream", term: "jet stream", definition: "Courant d'air haut" },
      ]
    );
    // "Le " before, "jet stream" term, " influence le temps" after → 3 segments
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: "text", text: "Le " });
    expect(result[1]).toEqual({
      type: "term",
      term: "jet stream",
      surface: "jet stream",
      definition: "Courant d'air haut",
    });
    expect(result[2]).toEqual({ type: "text", text: " influence le temps" });
  });

  it("should keep only first occurrence per term (2 segments: term + after)", () => {
    // Text starts with "jet stream", so no text-before segment
    const result = splitWithTerms(
      "jet stream et jet stream encore",
      [
        { surface: "jet stream", term: "jet stream", definition: "..." },
      ]
    );
    // First occurrence at position 0 → term + trailing text
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      type: "term",
      term: "jet stream",
      surface: "jet stream",
      definition: "...",
    });
    expect(result[1]).toEqual({ type: "text", text: " et jet stream encore" });
  });

  it("should handle no overlap between terms (4 segments)", () => {
    const result = splitWithTerms(
      "Un modèle et des actionneurs",
      [
        { surface: "modèle", term: "modèle", definition: "Procédé répété" },
        { surface: "actionneurs", term: "actionneurs", definition: "Entreprise qui pilote" },
      ]
    );
    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ type: "text", text: "Un " });
    expect(result[1]).toEqual({
      type: "term",
      term: "modèle",
      surface: "modèle",
      definition: "Procédé répété",
    });
    expect(result[2]).toEqual({ type: "text", text: " et des " });
    expect(result[3]).toEqual({
      type: "term",
      term: "actionneurs",
      surface: "actionneurs",
      definition: "Entreprise qui pilote",
    });
  });

  it("should handle overlap: earlier term wins (3 segments)", () => {
    // Both start at same position, "modèle" kept, "modèle industriel" ignored
    const result = splitWithTerms(
      "Un modèle industriel présenté",
      [
        { surface: "modèle", term: "modèle", definition: "Procédé répété" },
        { surface: "modèle industriel", term: "modèle industriel", definition: "Chaîne de production" },
      ]
    );
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: "text", text: "Un " });
    expect(result[1]).toEqual({
      type: "term",
      term: "modèle",
      surface: "modèle",
      definition: "Procédé répété",
    });
    expect(result[2]).toEqual({ type: "text", text: " industriel présenté" });
  });

  it("should handle accents in surface matching", () => {
    const result = splitWithTerms(
      "Le phénomène El Niño affecte le climat",
      [
        { surface: "El Niño", term: "El Niño", definition: "Réchauffement océanique" },
      ]
    );
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: "text", text: "Le phénomène " });
    expect(result[1]).toEqual({
      type: "term",
      term: "El Niño",
      surface: "El Niño",
      definition: "Réchauffement océanique",
    });
    expect(result[2]).toEqual({ type: "text", text: " affecte le climat" });
  });
});