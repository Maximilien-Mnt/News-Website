// Liste de brèves groupées par période temporelle avec titres collants.
// Spéc : DESIGN-SPEC §13 (groupes temporels), §16 (un <h2> par brève).
"use client";

import { groupLabel } from "../lib/time.js";
import { StoryItem } from "./StoryItem.js";
import type { Story } from "../lib/types.js";

export interface StoryListProps {
  stories: Story[];
  onLoadMore?: () => void;
}

/**
 * Regroupe les brèves par période et rend chaque groupe avec un titre collant.
 * Chaque brève a son propre <h2>.
 */
export function StoryList({ stories, onLoadMore }: StoryListProps) {
  // Trier par date décroissante (plus récent en premier)
  const sorted = [...stories].sort(
    (a, b) =>
      new Date(b.first_seen_at).getTime() - new Date(a.first_seen_at).getTime()
  );

  // Grouper par libellé de période
  const groups = new Map<string, Story[]>();
  for (const story of sorted) {
    const label = groupLabel(story.first_seen_at);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label)!.push(story);
  }

  return (
    <div className="story-list">
      {Array.from(groups.entries()).map(([label, groupStories]) => (
        <section key={label} className="story-list__group">
          <h2 className="story-list__group-title">{label}</h2>
          <ul className="story-list__items">
            {groupStories.map((story, index) => (
              <li key={story.id} className="story-list__item">
                <StoryItem story={story} index={index} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {onLoadMore && (
        <div className="story-list__load-more">
          <button onClick={onLoadMore}>Charger plus de brèves</button>
        </div>
      )}
    </div>
  );
}

export default StoryList;