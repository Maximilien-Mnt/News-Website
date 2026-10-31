// Skeleton du fil pendant le chargement, respecte prefers-reduced-motion.
// Spéc : DESIGN-SPEC §5 (rayons, structure), animations.css (.skeleton).
"use client";

export interface StoryListSkeletonProps {
  count?: number;
}

/** Affiche des squelettes de brèves pour préserver le CLS pendant le chargement. */
export function StoryListSkeleton({ count = 6 }: StoryListSkeletonProps) {
  return (
    <div className="story-list story-list--skeleton">
      {Array.from({ length: count }).map((_, idx) => (
        <article key={idx} className="story-item rail story-item--skeleton" data-level="mid">
          <div className="story-item__inner">
            <div className="story-item__time-skeleton">
              <div className="skeleton" style={{ width: "6rem", height: "1.2rem" }} />
            </div>
            <div className="story-item__content">
              <div className="skeleton story-item__headline-skeleton" style={{ width: "100%", height: "1.5rem" }} />
              <div className="skeleton story-item__summary-skeleton" style={{ width: "70%", height: "3rem", marginTop: "0.5rem" }} />
              <div className="skeleton story-item__meta-skeleton" style={{ width: "40%", height: "1rem", marginTop: "0.5rem" }} />
              <div className="skeleton story-item__sources-skeleton" style={{ width: "30%", height: "1.5rem", marginTop: "0.5rem" }} />
              <div className="skeleton story-item__ai-skeleton" style={{ width: "8rem", height: "1.5rem", marginTop: "0.5rem" }} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default StoryListSkeleton;