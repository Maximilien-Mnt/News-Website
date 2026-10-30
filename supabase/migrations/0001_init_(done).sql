-- Brève: initial schema. Run once in Supabase Dashboard > SQL Editor (or `supabase db push`).
-- Public data: sources, stories, story_sources, glossary, feed view. Private: raw_articles, ingestion_runs.

create table public.sources (
  id                   smallint generated always as identity primary key,
  slug                 text not null unique,
  name                 text not null,
  domain               text not null,
  feed_url             text,
  kind                 text not null default 'rss' check (kind in ('rss','api')),
  language             text not null default 'fr',          -- ISO 639-1
  country              text,                                 -- ISO 3166-1 alpha-2
  authority            smallint not null default 3 check (authority between 1 and 5),
  icon_url             text,
  active               boolean not null default true,
  consecutive_failures int not null default 0,
  last_fetched_at      timestamptz,
  created_at           timestamptz not null default now()
);

create table public.stories (
  id              bigint generated always as identity primary key,
  slug            text not null unique,
  headline        text not null,
  summary         text not null,
  explainer       text,                                      -- optional context, 1-2 sentences
  category        text not null check (category in
                    ('politique','economie','monde','conflits','tech','science','sante','climat','societe','culture','sport')),
  importance      smallint not null default 0 check (importance between 0 and 100),  -- intrinsic score
  llm_importance  smallint check (llm_importance between 0 and 100),
  hot_score       real not null default 0,                   -- importance decayed by age, recomputed hourly
  event_at        timestamptz,                               -- when the event happened (best estimate)
  first_seen_at   timestamptz not null default now(),
  last_source_at  timestamptz,
  updated_at      timestamptz not null default now(),
  source_count    smallint not null default 1,
  locations       jsonb not null default '[]'::jsonb,        -- [{"name":"Lisbonne","country":"PT"}]
  countries       text[] not null default '{}',              -- ISO alpha-2, for filtering
  languages       text[] not null default '{}',              -- original languages of the sources
  status          text not null default 'draft' check (status in ('draft','published','hidden')),
  needs_resummary boolean not null default true,
  summarized_at   timestamptz,
  model           text,
  prompt_version  text
);
create index stories_feed_idx       on public.stories (status, last_source_at desc);
create index stories_importance_idx on public.stories (status, importance desc);
create index stories_hot_idx        on public.stories (status, hot_score desc);
create index stories_category_idx   on public.stories (category);
create index stories_countries_gin  on public.stories using gin (countries);

create table public.raw_articles (
  id           bigint generated always as identity primary key,
  source_id    smallint not null references public.sources(id) on delete cascade,
  url          text not null,
  url_hash     text not null unique,                         -- sha256 of canonical URL
  title        text not null,
  snippet      text,                                         -- feed description, max ~500 chars. NEVER full text.
  language     text,
  published_at timestamptz,
  fetched_at   timestamptz not null default now(),
  title_tokens text[] not null default '{}',                 -- normalized tokens, for clustering
  story_id     bigint references public.stories(id) on delete set null
);
create index raw_articles_published_idx on public.raw_articles (published_at desc);
create index raw_articles_story_idx     on public.raw_articles (story_id);
create index raw_articles_unclustered   on public.raw_articles (fetched_at desc) where story_id is null;

create table public.story_sources (
  story_id     bigint not null references public.stories(id) on delete cascade,
  source_id    smallint not null references public.sources(id),
  url          text not null,
  title        text not null,
  published_at timestamptz,
  primary key (story_id, url)
);
create index story_sources_story_idx on public.story_sources (story_id);

create table public.glossary_terms (
  id            bigint generated always as identity primary key,
  canonical     text not null,
  canonical_key text not null unique,                        -- lower(canonical), used for dedupe
  definition    text not null,
  created_at    timestamptz not null default now()
);

create table public.story_terms (
  story_id bigint not null references public.stories(id) on delete cascade,
  term_id  bigint not null references public.glossary_terms(id) on delete cascade,
  surface  text not null,                                    -- exact text as it appears in the summary
  primary key (story_id, term_id, surface)
);

create table public.ingestion_runs (
  id              bigint generated always as identity primary key,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  feeds_ok        int not null default 0,
  feeds_failed    int not null default 0,
  new_articles    int not null default 0,
  stories_created int not null default 0,
  stories_updated int not null default 0,
  llm_calls       int not null default 0,
  errors          jsonb not null default '[]'::jsonb
);

-- One-request feed: story + sources + glossary terms as JSON. Respects RLS of the caller.
create or replace view public.feed_stories with (security_invoker = true) as
select
  s.id, s.slug, s.headline, s.summary, s.explainer, s.category,
  s.importance, s.hot_score, s.event_at, s.first_seen_at, s.last_source_at, s.updated_at,
  s.source_count, s.locations, s.countries, s.languages,
  coalesce((
    select jsonb_agg(jsonb_build_object(
      'name', so.name, 'domain', so.domain, 'icon_url', so.icon_url,
      'url', ss.url, 'title', ss.title, 'published_at', ss.published_at
    ) order by ss.published_at desc nulls last)
    from public.story_sources ss join public.sources so on so.id = ss.source_id
    where ss.story_id = s.id
  ), '[]'::jsonb) as sources,
  coalesce((
    select jsonb_agg(jsonb_build_object('surface', st.surface, 'term', g.canonical, 'definition', g.definition))
    from public.story_terms st join public.glossary_terms g on g.id = st.term_id
    where st.story_id = s.id
  ), '[]'::jsonb) as terms
from public.stories s
where s.status = 'published';

-- Row Level Security: anonymous visitors can only read published content.
alter table public.sources        enable row level security;
alter table public.stories        enable row level security;
alter table public.story_sources  enable row level security;
alter table public.glossary_terms enable row level security;
alter table public.story_terms    enable row level security;
alter table public.raw_articles   enable row level security;   -- no policy: private (secret key bypasses RLS)
alter table public.ingestion_runs enable row level security;   -- no policy: private

create policy "public read sources"  on public.sources        for select to anon, authenticated using (active);
create policy "public read stories"  on public.stories        for select to anon, authenticated using (status = 'published');
create policy "public read glossary" on public.glossary_terms for select to anon, authenticated using (true);
create policy "public read story_sources" on public.story_sources for select to anon, authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.status = 'published'));
create policy "public read story_terms" on public.story_terms for select to anon, authenticated
  using (exists (select 1 from public.stories s where s.id = story_id and s.status = 'published'));

grant usage on schema public to anon, authenticated;
grant select on public.sources, public.stories, public.story_sources, public.glossary_terms, public.story_terms to anon, authenticated;
grant select on public.feed_stories to anon, authenticated;
revoke all on public.raw_articles, public.ingestion_runs from anon, authenticated;
