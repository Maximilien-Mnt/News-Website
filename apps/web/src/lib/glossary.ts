/**
 * splitWithTerms(text, terms) → segments [{text}|{term, surface, definition}]
 * - Correspondance insensible à la casse sur `surface`
 * - Première occurrence seulement par terme dans le texte
 * - Pas de chevauchement (si deux termes se superposent, celui qui commence en premier l'emporte)
 * - Termes absents du texte sont ignorés
 * - L'ordre des segments suit l'apparition textuelle
 */
export type Segment = 
  | { type: "text"; text: string }
  | { type: "term"; term: string; surface: string; definition: string };

export function splitWithTerms(
  text: string,
  terms: Array<{ surface: string; term: string; definition: string }>
): Segment[] {
  if (text === undefined || text === null) return [{ type: "text", text: "" }];
  if (text === "") return [{ type: "text", text: "" }];
  if (terms.length === 0) return [{ type: "text", text }];

  // 1. Trouver la première occurrence de chaque terme (insensitive à la casse)
  const termMatches: Array<{
    surface: string;
    term: string;
    definition: string;
    start: number;
    end: number;
    length: number;
  }> = [];

  for (const ti of terms) {
    const lowerText = text.toLowerCase();
    const lowerSurface = ti.surface.toLowerCase();
    const index = lowerText.indexOf(lowerSurface);
    if (index !== -1) {
      termMatches.push({
        surface: ti.surface,
        term: ti.term,
        definition: ti.definition,
        start: index,
        end: index + ti.surface.length,
        length: ti.surface.length,
      });
    }
  }

  if (termMatches.length === 0) return [{ type: "text", text }];

  // 2. Trier par position de départ (earliest first)
  termMatches.sort((a, b) => a.start - b.start);

  // 3. Enlever les chevauchements : garder seulement le terme qui commence le premier
  //    à chaque position de conflit
  const kept: Array<{
    surface: string;
    term: string;
    definition: string;
    start: number;
    end: number;
    length: number;
  }> = [];

  for (const match of termMatches) {
    // Vérifier si cette occurrence overlap avec un terme déjà conservé
    let overlap = false;
    for (const k of kept) {
      // Chevauchement : les bornes se croisent
      if (match.start < k.end && match.end > k.start) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      kept.push(match);
    }
  }

  // 4. Re-sorter par position de départ (déjà trié, mais assuré)
  kept.sort((a, b) => a.start - b.start);

  // 5. Construire les segments
  const segments: Segment[] = [];
  let cursor = 0; // position courante dans le texte

  for (const k of kept) {
    // Texte avant ce terme
    if (k.start > cursor) {
      segments.push({
        type: "text",
        text: text.slice(cursor, k.start),
      });
    }
    // Le terme lui-même
    segments.push({
      type: "term",
      term: k.term,
      surface: k.surface,
      definition: k.definition,
    });
    cursor = k.end;
  }

  // Texte restant après le dernier terme
  if (cursor < text.length) {
    segments.push({
      type: "text",
      text: text.slice(cursor),
    });
  }

  return segments;
}