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
  console.log(
    `[ingest] done: feedsOk=${feedsOk} feedsFailed=${feedsFailed} newArticles=${newArticles}`,
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