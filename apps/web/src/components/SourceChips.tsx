// Affiche jusqu'à 3 sources avec favicon, puis « +N » si plus.
// Spéc : DESIGN-SPEC §16 (sources liées, favicon, monogramme de repli).
"use client";

import type { StorySource } from "../lib/types.js";

const MAX_VISIBLE = 3;

export interface SourceChipsProps {
  sources: StorySource[];
}

/** Extrait le domaine d'une URL pour l'affichage et la favicon. */
function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** Génère un monogramme (première lettre du domaine en majuscule). */
function monogram(domain: string): string {
  return domain.charAt(0).toUpperCase();
}

export function SourceChips({ sources }: SourceChipsProps) {
  const visible = sources.slice(0, MAX_VISIBLE);
  const overflow = sources.length - MAX_VISIBLE;

  return (
    <div className="source-chips" aria-label="Sources">
      {visible.map((source, idx) => {
        const domain = domainOf(source.url);
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

        return (
          <a
            key={idx}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="source-chip"
            aria-label={source.name}
          >
            <img
              src={faviconUrl}
              alt=""
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                const fallback = el.parentElement?.querySelector(".source-chip__monogram");
                if (fallback) {
                  (fallback as HTMLElement).style.display = "flex";
                }
              }}
              className="source-chip__favicon"
              width="24"
              height="24"
            />
            <span className="source-chip__monogram" style={{ display: "none" }}>
              {monogram(domain)}
            </span>
          </a>
        );
      })}
      {overflow > 0 && (
        <span className="source-chip source-chip__overflow" aria-hidden="true">
          +{overflow}
        </span>
      )}
    </div>
  );
}

export default SourceChips;