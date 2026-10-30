/**
 * Traitement typographique français (DESIGN-SPEC §4) :
 *   - espace insécable avant « : ; ! ? »
 *   - espace insécable après « « »
 *   - apostrophe typographique ’
 *   - points de suspension « … »
 *
 * Seuls ces remplacements sont appliqués, pour garder le résultat prévisible.
 */

export function frTypo(text: string): string {
  return (
    text
      // espace insécable avant la ponctuation
      .replace(/([^ :])([::;!?'»])/g, "$1\u00A0$2")
      // espace insécable après l'ouverture guillemet
      .replace(/«([^ »])/g, "«\u00A0$1")
      // apostrophe typographique pour l'apostrophe courante
      .replace(/([A-Za-z0-9À-ÖØ-öø-ÿ])'(?=[A-Za-z0-9À-ÖØ-öø-ÿ])/g, "$1\u2019")
      // points de suspension sur un seul caractère
      .replace(/\.\.\./g, "\u2026")
  );
}
