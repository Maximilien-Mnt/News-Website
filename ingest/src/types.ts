export type SourceKind = 'rss' | 'api';

export interface SourceRow {
  id?: number;
  slug: string;
  name: string;
  domain: string;
  feed_url: string;
  kind: SourceKind;
  language: string;
  country: string;
  authority: number;
  icon_url: string;
  active?: boolean;
  consecutive_failures?: number;
  last_fetched_at?: string | null;
}

export interface FeedItem {
  title: string;
  url: string;
  snippet: string;
  publishedAt: string | null;
}

export interface RawArticle {
  source_id: number;
  url: string;
  url_hash: string;
  title: string;
  snippet: string | null;
  language: string;
  published_at: string | null;
  title_tokens: string[];
}

export interface IngestionRun {
  startedAt: Date;
  finishedAt: Date;
  feedsOk: number;
  feedsFailed: number;
  newArticles: number;
  errors: Array<{ source: string; error: string }>;
}

export interface FetchResult {
  ok: boolean;
  items: FeedItem[];
  error?: string;
  consecutiveFailures: number;
  active: boolean;
}