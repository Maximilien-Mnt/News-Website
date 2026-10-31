// Un article du fil avec 4 niveaux d'importance via data-level.
// Spéc : DESIGN-SPEC §5 (rail), §6 (niveaux), §16 (anatomie d'une brève).
"use client";

import { levelOf, type ImportanceLevel, LEVEL_LABELS } from "../lib/levels.js";
import { TimeGutter } from "./TimeGutter.js";
import { MetaRow } from "./MetaRow.js";
import { SourceChips } from "./SourceChips.js";
import { AiNotice } from "./AiNotice.js";
import { GlossaryText } from "./GlossaryText";
import type { Story } from "../lib/types.js";
import { frTypo } from "../lib/frTypo.js";

export interface StoryItemProps {
  story: Story;
  index?: number;
}

/** Affiche une brève avec rail d'importance, titre, résumé, métadonnées, sources et notice IA. */
export function StoryItem({ story, index }: StoryItemProps) {
  const level: ImportanceLevel = levelOf(story.importance);
  const ariaLabel = LEVEL_LABELS[level];

  return (
    <article
      className="story-item rail"
      data-level={level}
      style={index !== undefined ? { "--i": String(index) } as React.CSSProperties : undefined}
    >
      <div className="story-item__inner">
        <TimeGutter datetime={story.first_seen_at} label={ariaLabel} />

        <div className="story-item__content">
          <h2 className="story-item__headline">
            <a href={`/b/${story.slug}`} aria-label={frTypo(story.headline)}>
              {frTypo(story.headline)}
            </a>
          </h2>

          <p className="story-item__summary">
            <GlossaryText text={story.summary} terms={story.terms} />
          </p>

          <MetaRow
            locations={story.locations}
            sourceCount={story.source_count}
          />

          <SourceChips sources={story.sources} />

          <div className="story-item__footer">
            <AiNotice />
          </div>
        </div>
      </div>
    </article>
  );
}

export default StoryItem;