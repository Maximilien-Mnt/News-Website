/**
 * Formatage du temps pour le fil, selon DESIGN-SPEC §13.
 *
 *   Relatif (relativeTime) :
 *     « à l'instant »  < 1 min
 *     « il y a 12 min » / « il y a 3 h »
 *
 *   Absolu (absoluteTime) :
 *     « hier, 18:42 »   (hier)
 *     « mar. 27 oct. »  (< 7 j)
 *     « 12 oct. 2026 »  (au-delà)
 *
 *   Groupes (groupLabel) :
 *     « Dernière heure » | « Aujourd'hui » | « Hier » |
 *     « Cette semaine » | « Plus ancien »
 *
 * Fuseau = navigateur. Format 24 h. `now` injecté (utile au test).
 */

/**
 * Relatif : « il y a 12 min », « il y a 3 h ».
 * style "short" donne les abbréviations « min » / « h » ;
 * numeric "auto" gère le pluriel.
 */
const frRtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto", style: "short" });

/** Absolu (jour/date) : « mar. 27 oct. », « 18:42 », « 12 oct. 2026 ». */
const frWeekday = new Intl.DateTimeFormat("fr", { weekday: "short" });
const frMonth = new Intl.DateTimeFormat("fr", { month: "short" });

const pad = (n: number): string => String(n).padStart(2, "0");

/**
 * Rend « 18:42 » (24 h), sans dépendre du fuseau du runtime.
 */
export function formatTime(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Relatif : « à l'instant », « il y a 12 min », « il y a 3 h ».
 * Utile seulement jusqu'à 1 j ; au-delà, on préfère absoluteTime.
 */
export function relativeTime(date: Date | string, now: Date = new Date()): string {
  const diffMs = toDate(date).getTime() - now.getTime();

  if (Math.abs(diffMs) < 60_000) return "à l'instant";

  const minutes = Math.round(diffMs / 60_000);  // garde le signe

  if (Math.abs(minutes) < 60) return frRtf.format(minutes, "minute");

  const hours = Math.round(minutes / 60);
  return frRtf.format(hours, "hour");
}

/**
 * Instant daté : « hier, 18:42 » (hier) ·
 * « mar. 27 oct. » (< 7 j) · « 12 oct. 2026 » (au-delà).
 */
export function absoluteTime(date: Date | string, now: Date = new Date()): string {
  const d = toDate(date);
  const nowDate = toDate(now);

  if (isYesterday(d, nowDate)) return `hier, ${formatTime(d)}`;

  const days = daysAgo(d, nowDate);
  if (days >= 1 && days < 7) {
    return `${frWeekday.format(d)} ${String(d.getDate())} ${frMonth.format(d)}`;
  }

  return `${String(d.getDate())} ${frMonth.format(d)} ${d.getFullYear()}`;
}

/**
 * Groupe de période : « Dernière heure » / « Aujourd'hui » / « Hier » /
 * « Cette semaine » / « Plus ancien ».
 */
export function groupLabel(date: Date | string, now: Date = new Date()): string {
  const d = toDate(date);

  const diffMs = d.getTime() - now.getTime();
  const absMinutes = Math.abs(diffMs) / 60_000;

  if (absMinutes < 60) return "Dernière heure";

  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return "Aujourd'hui";

  if (isYesterday(d, now)) return "Hier";

  const days = daysAgo(d, now);
  return days < 7 ? "Cette semaine" : "Plus ancien";
}

function toDate(v: Date | string): Date {
  return typeof v === "string" ? new Date(v) : v;
}

function toDateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  return toDateOnly(date).getTime() === yesterday.getTime();
}

function daysAgo(date: Date, now: Date): number {
  return Math.round(
    (toDateOnly(now).getTime() - toDateOnly(date).getTime()) / 86_400_000,
  );
}
