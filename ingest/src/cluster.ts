import { titleTokens } from './normalize';

function normalizeWord(word: string): string {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function extractCapitalizedEntities(title: string): Set<string> {
  const entities = new Set<string>();
  const words = title.split(/[\s,;.!?:()""''«»\-—/]+/).filter(
    (w) => w.length > 1 && w[0] === w[0].toUpperCase() && /[a-zA-Z]/.test(w[0])
  );
  for (const word of words) {
    entities.add(normalizeWord(word));
  }
  return entities;
}

function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function within48Hours(publishedA: string | null, publishedB: string | null): boolean {
  if (!publishedA || !publishedB) return false;
  const dateA = new Date(publishedA).getTime();
  const dateB = new Date(publishedB).getTime();
  const diffMs = Math.abs(dateA - dateB);
  const diffHours = diffMs / (1000 * 60 * 60);
  return diffHours <= 48;
}

function capitalEntitiesInCommon(titleA: string, titleB: string, tokensA: string[], tokensB: string[]): number {
  const entitiesA = extractCapitalizedEntities(titleA);
  const entitiesB = extractCapitalizedEntities(titleB);
  const common = new Set([...entitiesA].filter((e) => entitiesB.has(e)));
  return common.size;
}

export interface ClusterAssignment {
  storyId: number | null;
  title: string;
  publishedAt: string | null;
}

export function clusterArticles(
  unclustered: { article: RawArticle; storyId?: number }[],
  existingStories: { id: number; slug: string; headline: string; publishedAt?: string }[]
): ClusterAssignment[] {
  const assignments: ClusterAssignment[] = [];

  for (const item of unclustered) {
    const article = item.article;
    const articlePublished = article.published_at;
    let bestStoryId: number | null = null;
    let bestJaccard = 0;
    let bestCommonEntities = 0;
    let bestStoryTitle = "";

    for (const story of existingStories) {
      if (!within48Hours(articlePublished, story.publishedAt)) {
        continue;
      }

      const tokensA = article.title_tokens;
      const tokensB = story.title_tokens || [];
      const sim = jaccard(tokensA, tokensB);
      const capCommon = capitalEntitiesInCommon(article.title, story.headline, tokensA, tokensB);

      const clusterByJaccard = sim >= 0.45;
      const clusterByEntities = capCommon >= 2 && sim >= 0.30;

      if (clusterByJaccard || clusterByEntities) {
        if (sim > bestJaccard || (sim === bestJaccard && capCommon > bestCommonEntities)) {
          bestJaccard = sim;
          bestCommonEntities = capCommon;
          bestStoryId = story.id;
          bestStoryTitle = story.headline;
        }
      }
    }

    if (bestStoryId !== null) {
      assignments.push({ storyId: bestStoryId, title: bestStoryTitle, publishedAt: articlePublished });
    } else {
      assignments.push({ storyId: null, title: article.title, publishedAt: articlePublished });
    }
  }

  return assignments;
}

export function normalizeSlugTitle(title: string): string {
  const tokens = titleTokens(title);
  const first3 = tokens.slice(0, 3);
  return first3.join('-');
}