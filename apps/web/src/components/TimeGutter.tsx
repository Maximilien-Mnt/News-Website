// Affichage du temps pour une brève : relatif ou absolu selon l'ancienneté.
// Spéc : DESIGN-SPEC §13 (temps relatif/absolu, groupes, <time datetime>).
"use client";

import { relativeTime, absoluteTime, groupLabel } from "../lib/time.js";

export interface TimeGutterProps {
  datetime: string | Date;
  label?: string;
}

/** Affiche le temps de publication d'une brève. */
export function TimeGutter({ datetime, label }: TimeGutterProps) {
  const date = new Date(datetime);
  const now = new Date();

  const isRecent = now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000;
  const text = isRecent ? relativeTime(date, now) : absoluteTime(date, now);
  const group = groupLabel(date, now);

  return (
    <div className="time-gutter" aria-label={label || group}>
      <time dateTime={date.toISOString()}>{text}</time>
      <span className="time-gutter__group">{group}</span>
    </div>
  );
}

export default TimeGutter;