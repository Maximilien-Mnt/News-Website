import { z } from 'zod';
import { supabase, supabaseConfigured } from './supabase';
import type { Filters } from './filters';
import type { Story } from './types';
import { STORIES as MOCK_STORIES } from './mocks/stories';

/** Nombre de brèves renvoyées par page. */
export const STORIES_PER_PAGE = 20;

const StoriesResponseSchema = z.array(
  z.object({
    id: z.number(),
    slug: z.string(),
    headline: z.string(),
    summary: z.string(),
    explainer: z.string().nullable(),
    category: z.string(),
    importance: z.number(),
    hot_score: z.number(),
    event_at: z.string().nullable(),
    first_seen_at: z.string(),
    last_source_at: z.string().nullable(),
    updated_at: z.string(),
    source_count: z.number(),
    locations: z.array(
      z.object({
        name: z.string(),
        country: z.string().nullable(),
      }),
    ),
    countries: z.array(z.string()),
    languages: z.array(z.string()),
    sources: z.array(
      z.object({
        name: z.string(),
        domain: z.string(),
        icon_url: z.string().nullable(),
        url: z.string(),
        title: z.string(),
        published_at: z.string().nullable(),
      }),
    ),
    terms: z.array(
      z.object({
        surface: z.string(),
        term: z.string(),
        definition: z.string(),
      }),
    ),
  }),
);

export type StoriesResult =
  | { ok: true; data: Story[]; page: number; totalPages: number }
  | { ok: false; error: { message: string; code?: string } };

export interface Facets {
  periode: Record<string, number>;
  imp: Record<string, number>;
  cat: Record<string, number>;
  pays: Record<string, number>;
  lang: Record<string, number>;
}

/** Seuils d'importance pour chaque niveau. */
const IMP_THRESHOLDS = {
  essential: 85,
  important: 65,
  follow: 40,
} as const;

export interface OrderSpec {
  column: string;
  options?: { ascending: boolean; nulls?: 'first' | 'last' };
}

/** Normalise `tri` en spécification d'ordre PostgREST. */
export function orderFor(tri: string): OrderSpec {
  switch (tri) {
    case 'recent':
      return { column: 'last_source_at', options: { ascending: false, nulls: 'last' } };
    case 'old':
      return { column: 'last_source_at', options: { ascending: true } };
    case 'important':
      return { column: 'importance', options: { ascending: false } };
    case 'sources':
      return { column: 'source_count', options: { ascending: false } };
    case 'une':
    case 'hot':
    default:
      return { column: 'hot_score', options: { ascending: false } };
  }
}

/** Échappe un texte pour une expression `ilike` (anti-% ,anti-_,anti-\). */
export function escapeLike(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_');
}

/**
 * Traduit un objet `Filters` en paramètres PostgREST pour la vue `feed_stories`.
 * Fonction pure : ne fait ni appel, ni lecture de base.
 */
export function buildStoriesParams(
  filters: Filters,
  now: Date = new Date(),
): Record<string, string | string[] | number> {
  const params: Record<string, string | string[] | number> = {};
  const epoch = now.getTime();

  // Recherche textuelle sur headline + summary (ILIKE échappé).
  if (filters.q) {
    const pattern = escapeLike(filters.q.trim());
    params.or = `headline.ilike.*.${pattern},summary.ilike.*.${pattern}`;
  }

  // Période -> last_source_at >= maintenant - X.
  if (filters.periode) {
    const hoursMap: Record<string, number> = {
      '24h': 24,
      '7j': 168,
      '1m': 720,
      '3m': 2160,
      '6m': 4320,
      '1a': 8760,
    };
    const hours = hoursMap[filters.periode];
    if (hours !== undefined) {
      params['last_source_at.gte'] = new Date(epoch - hours * 3_600_000).toISOString();
    }
  }

  // Catégorie -> IN.
  if (filters.cat?.length) {
    params.category = `in.(${filters.cat.join(',')})`;
  }

  // Importance -> gte (sauf 'brief' qui est < 40).
  if (filters.imp) {
    if (filters.imp === 'brief') {
      params.importance = 'lt.40';
    } else {
      params.importance = `gte.${IMP_THRESHOLDS[filters.imp as keyof typeof IMP_THRESHOLDS]}`;
    }
  }

  // Pays -> overlap sur le tableau countries.
  if (filters.pays?.length) {
    params.countries = `ov.{${filters.pays.join(',')}}`;
  }

  // Source -> contains sur le jsonb sources avec un objet {domain}.
  if (filters.src?.length) {
    params.sources = `cs.[${JSON.stringify(filters.src.map((domain) => ({ domain })))}]`;
  }

  // Langue -> overlap sur le tableau languages.
  if (filters.lang?.length) {
    params.languages = `ov.{${filters.lang.join(',')}}`;
  }

  // Tri.
  const { column, options } = orderFor(filters.tri);

  return params;
}


/**
 * Lit les brèves depuis la vue `feed_stories` puis les valide avec zod.
 * Retourne une erreur structurée plutôt qu'une exception non gérée.
 */
export async function fetchStories(
  filters: Filters,
  page = 1,
): Promise<StoriesResult> {
  if (!supabaseConfigured) {
    // Fallback dev : pas de variable Supabase publique -> brèves factices.
    return {
      ok: true,
      data: MOCK_STORIES.slice(0, STORIES_PER_PAGE),
      page,
      totalPages: 1,
    };
  }

  const from = (page - 1) * STORIES_PER_PAGE;
  const to = from + STORIES_PER_PAGE;

  let error: unknown;
  let rows: Story[] = [];
  let count: number | null = null;

  try {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error: err, count: c } = await supabase
      .from('feed_stories')
      .select('*', { count: 'exact' })
      .order(orderFor(filters.tri).column, orderFor(filters.tri).options)
      .range(from, to);

    rows = data ?? [];
    error = err;
    count = c;
  } catch (err) {
    error = err;
  }

  if (error) {
    return {
      ok: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: error instanceof Error ? (error as any).code : undefined,
      },
    };
  }

  // Validation : refuse toute ligne invalide plutôt que de propager une mauvaise forme.
  const parsed = StoriesResponseSchema.safeParse(rows);
  if (!parsed.success) {
    console.error('[api] feed_stories validation failed:', parsed.error);
    return { ok: false, error: { message: 'Données invalides depuis la base' } };
  }

  const total = count ?? parsed.data.length;
  return {
    ok: true,
    data: parsed.data,
    page,
    totalPages: Math.max(1, Math.ceil(total / STORIES_PER_PAGE)),
  };
}

/**
 * Compte les facettes (catégories, pays, langues, importance, période).
 * Fonction pure pour être testable.
 */
export function computeFacets(stories: Story[], now: Date = new Date()): Facets {
  const periodeCounts: Record<string, number> = {
    '24h': 0,
    '7j': 0,
    '1m': 0,
    '3m': 0,
    '6m': 0,
    '1a': 0,
  };
  const impCounts: Record<string, number> = {
    essential: 0,
    important: 0,
    follow: 0,
    brief: 0,
  };
  const catCounts: Record<string, number> = {};
  const paysCounts: Record<string, number> = {};
  const langCounts: Record<string, number> = {};

  for (const story of stories) {
    const lastSourceAt = story.last_source_at ? new Date(story.last_source_at).getTime() : 0;
    const ageHours = lastSourceAt ? (now.getTime() - lastSourceAt) / 3_600_000 : 0;

    if (ageHours <= 24) periodeCounts['24h'] = (periodeCounts['24h'] ?? 0) + 1;
    else if (ageHours <= 24 * 7) periodeCounts['7j'] = (periodeCounts['7j'] ?? 0) + 1;
    else if (ageHours <= 24 * 30) periodeCounts['1m'] = (periodeCounts['1m'] ?? 0) + 1;
    else if (ageHours <= 24 * 90) periodeCounts['3m'] = (periodeCounts['3m'] ?? 0) + 1;
    else if (ageHours <= 24 * 180) periodeCounts['6m'] = (periodeCounts['6m'] ?? 0) + 1;
    else periodeCounts['1a'] = (periodeCounts['1a'] ?? 0) + 1;

    const importance = story.importance;
    if (importance >= 85) impCounts['essential'] = (impCounts['essential'] ?? 0) + 1;
    else if (importance >= 65) impCounts['important'] = (impCounts['important'] ?? 0) + 1;
    else if (importance >= 40) impCounts['follow'] = (impCounts['follow'] ?? 0) + 1;
    else impCounts['brief'] = (impCounts['brief'] ?? 0) + 1;

    const category = story.category;
    catCounts[category] = (catCounts[category] ?? 0) + 1;

    for (const country of story.countries ?? []) {
      paysCounts[country] = (paysCounts[country] ?? 0) + 1;
    }

    for (const language of story.languages ?? []) {
      langCounts[language] = (langCounts[language] ?? 0) + 1;
    }
  }

  return {
    periode: periodeCounts,
    imp: impCounts,
    cat: catCounts,
    pays: paysCounts,
    lang: langCounts,
  };
}

/**
 * Comptages de facettes pour le panneau de filtres.
 * Réutilise la même requête que fetchStories (première page) puis agrège en mémoire.
 */
export async function fetchFacets(
  filters: Filters,
): Promise<{ ok: boolean; facets?: Facets; error?: { message: string } }> {
  if (!supabaseConfigured) {
    return { ok: true };
  }

  const storiesResult = await fetchStories(filters, 1);
  if (!storiesResult.ok) {
    return { ok: false, error: { message: storiesResult.error.message } };
  }

  return { ok: true, facets: computeFacets(storiesResult.data) };
}
