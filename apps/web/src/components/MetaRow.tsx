// Ligne de métadonnées sous le résumé : lieu, nombre de sources, etc.
// Spéc : DESIGN-SPEC §16 (anatomie d'une brève).
"use client";

import { Icon } from "./Icon.js";
import type { StoryLocation } from "../lib/types.js";
import { frTypo } from "../lib/frTypo.js";

export interface MetaRowProps {
  locations: StoryLocation[];
  sourceCount: number;
}

/** Affiche lieu et nombre de sources sous forme de métadonnées. */
export function MetaRow({ locations, sourceCount }: MetaRowProps) {
  const firstLocation = locations[0];

  return (
    <div className="meta-row">
      {firstLocation && (
        <span className="meta-row__item" aria-label={`Lieu : ${firstLocation.name}`}>
          <Icon name="pin" className="meta-row__icon" aria-hidden="true" />
          <span className="meta-row__text">{frTypo(firstLocation.name)}</span>
        </span>
      )}
      {sourceCount > 0 && (
        <span className="meta-row__item" aria-label={`${sourceCount} source${sourceCount > 1 ? "s" : ""}`}>
          <Icon name="layers" className="meta-row__icon" aria-hidden="true" />
          <span className="meta-row__text">
            {sourceCount} source{sourceCount > 1 ? "s" : ""}
          </span>
        </span>
      )}
    </div>
  );
}

export default MetaRow;