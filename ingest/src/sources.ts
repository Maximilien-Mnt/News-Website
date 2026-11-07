import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { upsertSources } from './db';
import type { SourceRow } from './types';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const SEED_PATH = resolve(__dirname, '../sources.seed.json');

export interface SourceSeed {
  slug: string;
  name: string;
  domain: string;
  feed_url: string;
  language: string;
  country: string;
  authority: number;
}

export function loadSources(): SourceRow[] {
  const seed = JSON.parse(readFileSync(SEED_PATH, 'utf8')) as {
    sources: SourceSeed[];
  };
  return seed.sources.map((s) => ({
    ...s,
    kind: 'rss' as const,
    icon_url: `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
      s.domain,
    )}&sz=64`,
  }));
}

export async function syncSources(): Promise<SourceRow[]> {
  const rows = loadSources();
  await upsertSources(rows);
  return rows;
}