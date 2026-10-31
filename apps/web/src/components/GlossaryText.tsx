/**
 * GlossaryText — surligne les termes dans du texte et ouvre une bulle Popover Radix.
 * Usage : <GlossaryText text={summary} terms={terms} />
 * - Chaque terme = <button class="term" aria-expanded> dans le texte
 * - Ouverture: clic/Entrée/Espace sur le bouton + survol desktop (délai 150ms)
 * - Fermeture: Échap, clic extérieur; focus revient au bouton
 * - aria-expanded géré par le composant; la bulle ne dépasse jamais 375px
 */
import { Popover, PopoverContent } from "@radix-ui/react-popover";
import { splitWithTerms } from "../lib/glossary";
import { frTypo } from "../lib/frTypo.js";

type TermInfo = {
  surface: string;
  term: string;
  definition: string;
};

type GlossaryTextProps = {
  text: string;
  terms: TermInfo[];
  termClassName?: string;
  popoverMaxWidth?: number;
};

export function GlossaryText({
  text,
  terms,
  termClassName = "",
  popoverMaxWidth = 375,
}: GlossaryTextProps) {
  const segments = splitWithTerms(frTypo(text), terms) as Array<{ type: "text"; text: string } | { type: "term"; term: string; definition: string }>;

  return (
    <Popover>
      {segments.map((segment, segIdx) => {
        // TypeScript narrowing
        if (segment.type === "text") {
          return <span key={segIdx} className="glossary-text__text">
            {segment.text}
          </span>;
        }

        // Terme : bouton + PopoverContent
        return (
          <>
            <button
              className={`glossary-text__term ${termClassName} term`}
              aria-expanded="false"
              aria-controls={`glossary-popover-${segIdx}`}
            >
              {segment.term}
            </button>

            <PopoverContent
              className="popover"
              side="bottom"
              align="start"
              style={{ maxWidth: `${popoverMaxWidth}px` }}
            >
              <strong>{segment.term}</strong>
              <span>{segment.definition}</span>
              <div />
            </PopoverContent>
          </>
        );
      })}
    </Popover>
  );
}