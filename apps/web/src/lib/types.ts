/**
 * Modèles de la vue `feed_stories` de `supabase/migrations/0001_init_(done).sql`.
 *
 * Seule la couche de données pure est ici : pas de lien avec Astro, Supabase
 * ni le navigateur. La structure correspond exactement aux colonnes de la vue.
 */

import { z } from "zod";

const StoryLocationSchema = z.object({
  name: z.string(),
  country: z.string().nullable(),
});

const StorySourceSchema = z.object({
  name: z.string(),
  domain: z.string(),
  icon_url: z.string().nullable(),
  url: z.string(),
  title: z.string(),
  published_at: z.string().nullable(),
});

const StoryTermSchema = z.object({
  surface: z.string(),
  term: z.string(),
  definition: z.string(),
});

export const StorySchema = z.object({
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
  locations: z.array(StoryLocationSchema),
  countries: z.array(z.string()),
  languages: z.array(z.string()),
  sources: z.array(StorySourceSchema),
  terms: z.array(StoryTermSchema),
});

export type Story = z.infer<typeof StorySchema>;
export type StoryLocation = z.infer<typeof StoryLocationSchema>;
export type StorySource = z.infer<typeof StorySourceSchema>;
export type StoryTerm = z.infer<typeof StoryTermSchema>;
