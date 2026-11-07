import { config } from './config';
import {
  getActiveSources,
  insertIngestionRun,
  insertRawArticles,
  markFetchResult,
} from './db';
import { loadSources, syncSources } from './sources';
import { fetchFeed } from './fetchFeeds';
import { normalizeItem } from './normalize';
import { clusterArticles, normalizeSlugTitle } from './cluster';
import { createStory, updateStoryWithNewArticle, initializeRawArticles } from './persist';
import type { SourceRow } from './types';

async function main(): Promise<void> {
  const cfg = config;
  const startedAt = new Date();
  let feedsOk = 0;
  let feedsFailed = 0;
  let newArticles = 0;
  const errors: Array<{ source: string; error: string }> = [];

  let sources: SourceRow[];
  if (cfg.DRY_RUN) {
    sources = loadSources();
  } else {
    await syncSources();
    sources = await getActiveSources();
  }

  console.log(
    `[ingest] start ${sources.length} source(s) (dry-run=${cfg.DRY_RUN})`,
  );

  for (const source of sources) {
    const result = await fetchFeed(source);

    if (result.ok) {
      feedsOk++;
      console.log(
        `  OK ${source.slug} — ${result.items.length} article(s) in window`,
      );
      if (!cfg.DRY_RUN && source.id !== undefined) {
        await markFetchResult(source.id, {
          consecutiveFailures: 0,
          lastFetchedAt: new Date().toISOString(),
          active: true,
        });
      }
    } else {
      feedsFailed++;
      errors.push({ source: source.slug, error: result.error ?? 'unknown' });
      console.log(`  KO ${source.slug} — ${result.error}`);
      if (!cfg.DRY_RUN && source.id !== undefined) {
        await markFetchResult(source.id, {
          consecutiveFailures: result.consecutiveFailures,
          lastFetchedAt: null,
          active: result.active,
        });
      }
    }

    const normalized = result.items.map((item) =>
      normalizeItem(item, Number(source.id ?? 0), source.language),
    );

    if (!cfg.DRY_RUN && normalized.length > 0) {
      newArticles += await insertRawArticles(normalized);
    }
  }

  const finishedAt = new Date();
  let storiesCreated = 0;
  let storiesUpdated = 0;

  if (!cfg.DRY_RUN) {
    // Get all newly inserted raw articles that don't have a story_id yet
    const { data: unassignedArticles, error: fetchError } = await supabase
      .from('raw_articles')
      .select('*')
      .is('story_id', null);

    if (fetchError) throw fetchError;
    if (!unassignedArticles || unassignedArticles.length === 0) {
      console.log('[ingest] No new unassigned articles to cluster');
    } else {
      // Build the unclustered items for clustering
      const unclustered = unassignedArticles.map((article: any) => ({
        article: {
          source_id: article.source_id,
          url: article.url,
          url_hash: article.url_hash,
          title: article.title,
          snippet: article.snippet,
          language: article.language,
          published_at: article.published_at,
          title_tokens: article.title_tokens,
        } as RawArticle,
      }));

      // Get existing stories with their data for clustering
      const { data: existingStories, error: storiesError } = await supabase
        .from('stories')
        .select('id, slug, headline, published_at, title_tokens')
        .neq('status', 'published');

      if (storiesError) throw storiesError;

      // Run clustering
      const assignments = clusterArticles(unclustered, existingStories || []);

      // Process assignments: group by storyId
      const storyGroups = new Map<number | string, {
        articles: RawArticle[];
        sources: Array<{ source_id: number; language: string }>;
      }>();

      for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i];
        const article = unclustered[i].article;

        if (assignment.storyId === null) {
          // Create new story
          const newStoryId = await createStory(article, article.source_id, article.language);
          storiesCreated++;

          // Initialize group for new story
          if (!storyGroups.has(null)) {
            storyGroups.set(null, { articles: [], sources: [] });
          }
          storyGroups.get(null)!.articles.push(article);
          storyGroups.get(null)!.sources.push({
            source_id: article.source_id,
            language: article.language,
          });
        } else {
          const storyId = typeof assignment.storyId === 'number'
            ? assignment.storyId
            : Number(assignment.storyId);

          // Check if story already has articles from this source
          const existingGroup = Array.from(storyGroups.values()).find(
            (g) => g.sources.some(
              (s: { source_id: number }) => s.source_id === article.source_id,
            ),
          );

          if (existingGroup) {
            // Update existing story with new source
            storiesUpdated++;
            await updateStoryWithNewArticle(storyId, article.source_id, article.language);

            if (
              !existingGroup.articles.some(
                (a: RawArticle) => a.url_hash === article.url_hash,
              )
            ) {
              existingGroup.articles.push(article);
              existingGroup.sources.push({
                source_id: article.source_id,
                language: article.language,
              });
            }
          } else {
            // Assign to existing story
            storiesUpdated++;
            await updateStoryWithNewArticle(storyId, article.source_id, article.language);

            if (!storyGroups.has(storyId)) {
              storyGroups.set(storyId, { articles: [], sources: [] });
            }
            storyGroups.get(storyId)!.articles.push(article);
            storyGroups.get(storyId)!.sources.push({
              source_id: article.source_id,
              language: article.language,
            });
          }
        }
      }

      // Mark articles as assigned by setting story_id
      const urlHashes = unassignedArticles.map((a: any) => a.url_hash);
      if (urlHashes.length > 0) {
        await initializeRawArticles(urlHashes);
      }

      console.log(`[ingest] Clustering: created=${storiesCreated}, updated=${storiesUpdated}`);
    }
  } else {
    // DRY_RUN mode: just log what would happen
    console.log('[ingest-DRY_RUN] Would cluster articles and create/update stories');
  }

  console.log(
    `[ingest] done: feedsOk=${feedsOk} feedsFailed=${feedsFailed} newArticles=${newArticles}, storiesCreated=${storiesCreated}, storiesUpdated=${storiesUpdated}`,
  );

  if (!cfg.DRY_RUN) {
    await insertIngestionRun({
      startedAt,
      finishedAt,
      feedsOk,
      feedsFailed,
      newArticles,
      errors,
    });
  }
}

main().catch((err) => {
  console.error('[ingest] fatal:', err);
  process.exit(1);
});