// Notice « Résumé généré par IA » avec bouton info et Popover Radix.
// Spéc : DESIGN-SPEC §10 (mention IA + lien vers la page Méthode).
"use client";

import { Popover, PopoverTrigger, PopoverContent } from "@radix-ui/react-popover";
import { Icon } from "./Icon.js";

export function AiNotice() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="ai-notice"
          aria-label="En savoir plus sur le résumé généré par IA"
        >
          <Icon name="info" aria-label="Info résumé IA" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="popover ai-popover" align="start" side="bottom">
        <strong>Résumé généré par IA</strong>
        <p>
          Ce résumé est une reformulation originale des titres et extraits des
          sources liées. Chaque brève cite ses sources.
        </p>
        <a href="/methode" className="ai-popover__link">
          Notre méthode
          <Icon name="external" aria-label="(nouvel onglet)" />
        </a>
      </PopoverContent>
    </Popover>
  );
}

export default AiNotice;