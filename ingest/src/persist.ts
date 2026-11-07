import { supabase } from './db';
import { RawArticle } from './types';
import { normalizeSlugTitle } from './cluster';

/**
 * Create a new story from a raw article and source.
 * 
 * @param article The raw article to create story from
 * @param sourceId The source ID
 * @param sourceLanguage The source language
 * @returns The created story ID
 */
export async function createStory(
  article: RawArticle,
  sourceId: number,
  sourceLanguage: string
): Promise<number> {
  const slug = normalizeSlugTitle(article.title);
  const now = new Date().toISOString();

  const { data: story, error } = await supabase
    .from('stories')
    .insert({
      slug,
      headline: article.title,
      summary: article.snippet || '',
      category: 'monde', // default, will be overridden by ingest logic
      importance: 0,
      llm_importance: 0,
      hot_score: 0,
      event_at: null,
      first_seen_at: now,
      last_source_at: now,
      source_count: 1,
      locations: '[]' as const,
      countries: '{}' as string[],
      languages: [sourceLanguage],
      status: 'draft' as const,
      needs_resummary: true,
      summarized_at: null,
      model: null,
      prompt_version: null,
    })
    .select('id')
    .single();

  if (error) throw error;
  if (!data?.id) throw new Error('No story ID returned');

  // Insert story_sources
  await supabase.from('story_sources').insert({
    story_id: data.id,
    source_id: sourceId,
    title: article.title,
    url: article.url,
    published_at: article.published_at,
  });

  // Update raw_articles to link to story
  await supabase.from('raw_articles').update({ story_id: data.id }).eq('url_hash', article.url_hash);

  return data.id;
}

/**
 * Update an existing story with a new article source.
 * 
 * @param storyId The story ID to update
 * @param sourceId The new source ID
 * @param sourceLanguage The new source language
 * @returns Updated story data
 */
export async function updateStoryWithNewArticle(
  storyId: number,
  sourceId: number,
  sourceLanguage: string
): Promise<void> {
  // Update story: needs_resummary = true, increment source_count, update last_source_at
  const { error } = await supabase
    .from('stories')
    .update({
      needs_resummary: true,
      source_count: { inc: 1 },
      last_source_at: new Date().toISOString(),
    })
    .eq('id', storyId);

  if (error) throw error;

  // Add new story_source
  await supabase.from('story_sources').insert({
    story_id: storyId,
    source_id: sourceId,
    title: '', // will be filled by fetch, or we can get from article
    url: '',
    published_at: null,
  });

  // Update raw_articles to link to story (if not already linked)
  // This handles the case where an article might need story_id set
}

/**
 * Initialize raw_articles without a story_id (for new articles before clustering).
 * 
 * This should be called after inserting raw articles but before clustering.
 * 
 * @param urlHashes The URL hashes of the articles to initialize
 */
export async function initializeRawArticles(urlHashes: string[]): Promise<void> {
  if (urlHashes.length === 0) return;

  await supabase.from('raw_articles').update({ story_id: null }).in('url_hash', urlHashes);
}