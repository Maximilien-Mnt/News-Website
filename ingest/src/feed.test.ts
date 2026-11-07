import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import Parser from 'rss-parser';
import { describe, it, expect } from 'vitest';
import { normalizeItem } from './normalize';
import type { FeedItem } from './types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const parser = new Parser();

function toFeedItem(item: any): FeedItem {
  return {
    title: item.title ?? '',
    url: item.link ?? '',
    snippet: item.contentSnippet ?? item.content ?? item.summary ?? '',
    publishedAt: item.isoDate ?? item.pubDate ?? null,
  };
}

describe('feed fixture (offline)', () => {
  it('parses local RSS fixture and normalizes items without network', async () => {
    const xml = readFileSync(
      resolve(__dirname, 'fixtures/sample-feed.xml'),
      'utf8',
    );
    const feed = await parser.parseString(xml);
    const feedItems = feed.items.map(toFeedItem);

    expect(feedItems.length).toBe(3);

    const utmItem = feedItems.find((i) => i.url.includes('utm_source'));
    expect(utmItem).toBeDefined();

    const norm = normalizeItem(utmItem!, 1, 'fr');
    expect(norm.url).not.toContain('utm_source');
    expect(norm.url).not.toContain('#section');
    expect(norm.url_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(norm.title).toContain('entités');
    expect(norm.snippet).not.toMatch(/<[^>]+>/);
    expect(norm.snippet).toContain('extrait');
    expect(norm.snippet).toContain('HTML');
    expect(norm.title_tokens).not.toContain('le');
    expect(norm.title_tokens).not.toContain('the');
  });
});