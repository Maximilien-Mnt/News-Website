import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';
import type { IngestionRun, RawArticle, SourceRow } from './types';

export const supabase: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SECRET_KEY,
);

export async function upsertSources(rows: Omit<SourceRow, 'id'>[]): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await supabase.from('sources').upsert(rows, { onConflict: 'slug' });
  if (error) throw error;
}

export async function getActiveSources(): Promise<SourceRow[]> {
  const { data, error } = await supabase.from('sources').select('*').eq('active', true);
  if (error) throw error;
  return (data ?? []) as SourceRow[];
}

export interface FetchResultUpdate {
  consecutiveFailures: number;
  lastFetchedAt: string | null;
  active: boolean;
}

export async function markFetchResult(
  sourceId: number,
  result: FetchResultUpdate,
): Promise<void> {
  const { error } = await supabase
    .from('sources')
    .update({
      consecutive_failures: result.consecutiveFailures,
      last_fetched_at: result.lastFetchedAt,
      active: result.active,
    })
    .eq('id', sourceId);
  if (error) throw error;
}

export async function insertRawArticles(articles: RawArticle[]): Promise<number> {
  if (articles.length === 0) return 0;
  const hashes = articles.map((a) => a.url_hash);
  const { data: existing, error: readError } = await supabase
    .from('raw_articles')
    .select('url_hash')
    .in('url_hash', hashes);
  if (readError) throw readError;
  const existingSet = new Set(
    (existing ?? []).map((r: { url_hash: string }) => r.url_hash),
  );
  const toInsert = articles.filter((a) => !existingSet.has(a.url_hash));
  if (toInsert.length === 0) return 0;
  const { error: insertError } = await supabase.from('raw_articles').insert(toInsert);
  if (insertError) throw insertError;
  return toInsert.length;
}

export async function insertIngestionRun(run: IngestionRun): Promise<void> {
  const { error } = await supabase.from('ingestion_runs').insert([
    {
      started_at: run.startedAt.toISOString(),
      finished_at: run.finishedAt.toISOString(),
      feeds_ok: run.feedsOk,
      feeds_failed: run.feedsFailed,
      new_articles: run.newArticles,
      stories_created: 0,
      stories_updated: 0,
      llm_calls: 0,
      errors: run.errors,
    },
  ]);
  if (error) throw error;
}