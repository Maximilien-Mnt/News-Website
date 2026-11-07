import Parser from 'rss-parser';
import { config } from './config';
import type { FetchResult, FeedItem, SourceRow } from './types';

const parser = new Parser();

export async function fetchFeed(source: SourceRow): Promise<FetchResult> {
  const failures = source.consecutive_failures ?? 0;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);
    const res = await fetch(source.feed_url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'BreveBot/0.1' },
    });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const feed = await parser.parseString(text);

    const now = new Date();
    const windowStart = new Date(
      now.getTime() - config.INGEST_WINDOW_HOURS * 60 * 60 * 1000,
    );

    const items: FeedItem[] = (feed.items ?? [])
      .map((item: any) => ({
        title: item.title ?? '',
        url: item.link ?? '',
        snippet: item.contentSnippet ?? item.content ?? item.summary ?? '',
        publishedAt: item.isoDate ?? item.pubDate ?? null,
      }))
      .filter((item) => {
        if (!item.publishedAt) return true;
        const d = new Date(item.publishedAt);
        return !isNaN(d.getTime()) && d >= windowStart;
      })
      .slice(0, config.INGEST_MAX_ITEMS_PER_FEED);

    return { ok: true, items, consecutiveFailures: 0, active: true };
  } catch (err) {
    const newFailures = failures + 1;
    return {
      ok: false,
      items: [],
      error: err instanceof Error ? err.message : String(err),
      consecutiveFailures: newFailures,
      active: newFailures < 5,
    };
  }
}