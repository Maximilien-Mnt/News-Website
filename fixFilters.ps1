/**
 * Filtre, tri et facettes pour le fil d'actualités "Brève".
 *
 * Nom des paramètres d'URL (section 12 DESIGN-SPEC) :
 *   q, periode, cat, imp, pays, src, lang, tri
 *
 * Valeurs par défaut : periode=24h, tri=une
 */

import type { Story, StorySource } from "./types";

/** Toutes les clés possibles du filtre, order matters pour serialize/parse */
export type Filters = {
  q: string          // recherche textuelle (correspond aux titres/résumés)
  periode: string    // '24h' | '7j' | '1m' | '3m' | '6m' | '1a'
  cat: string[]      // catégories actives (ex: ['Environnement', 'Science'])
  imp: string        // niveau d'importance 'essential' | 'important' | 'follow' | 'brief'
  pays: string[]     // pays codes ISO 2 lettres (ex: ['FR', 'CH'])
  src: string[]      // noms de source (ex: ['Le Monde', 'BBC'])
  lang: string[]     // codes langue (ex: ['fr', 'en'])
  tri: string        // 'une' | 'recent' | 'hot' | 'old'
}

/** Valeurs par défaut des filtres (section 12 DESIGN-SPEC) */
export const defaultFilters: Filters = {
  q: '',
  periode: '24h',
  cat: [],
  imp: '',
  pays: [],
  src: [],
  lang: [],
  tri: 'une',
};

/** États possibles pour chaque filtre (options de UI) */
export const PERIODE_OPTIONS = ['24h', '7j', '1m', '3m', '6m', '1a'] as const
export type Periode = typeof PERIODE_OPTIONS[number]

export const TRI_OPTIONS = ['une', 'recent', 'hot', 'old'] as const
export type Tri = typeof TRI_OPTIONS[number]

/**
 * Applique les filtres à une liste d'histoires.
 * Retourne les histoires qui correspondent à tous les critères actifs.
 */
export function applyFilters(
  stories: Story[],
  filters: Filters,
  now: Date
): Story[] {
  return stories.filter((story) => {
    // --- recherche textuelle q ---
    if (filters.q && filters.q.length > 0) {
      const qLower = filters.q.toLowerCase()
      const matchesQuery =
        story.headline.toLowerCase().includes(qLower) ||
        (story.summary && story.summary.toLowerCase().includes(qLower))
      if (!matchesQuery) return false
    }

    // --- filtrage par période ---
    if (!isWithinPeriod(story, filters.periode, now)) return false

    // --- filtrage par catégorie ---
    if (filters.cat && filters.cat.length > 0 && !filters.cat.includes(story.category)) {
      return false
    }

    // --- filtrage par niveau d'importance ---
    // Chaque niveau a un seuil minimum; 'brief' signifie < 40
    const impThresholds: Record<string, number> = {
      essential: 85,
      important: 65,
      follow: 40,
      brief: -1, // spécial: -1 signifie "tout en dessous de follow"
    }
    const threshold = impThresholds[filters.imp]!
    if (filters.imp) {
      if (filters.imp === 'brief') {
        // 'brief' : montrer seulement stories avec importance < 40
        if (story.importance >= 40) return false
      } else if (story.importance < threshold) {
        return false
      }
    }

    // --- filtrage par pays ---
    if (filters.pays && filters.pays.length > 0) {
      const storyCountries = story.countries || []
      if (!storyCountries.some((c: string) => filters.pays!.includes(c))) return false
    }

    // --- filtrage par source ---
    if (filters.src && filters.src.length > 0) {
      const storySrcNames = story.sources?.map((s: StorySource) => s.name) || []
      if (!storySrcNames.some((s: string) => filters.src!.includes(s))) return false
    }

    // --- filtrage par langue ---
    if (filters.lang && filters.lang.length > 0) {
      const storyLangs = story.languages || []
      if (!storyLangs.some((l: string) => filters.lang!.includes(l))) return false
    }

    return true
  })
}

/**
 * Analyse les searchParams de l'URL et retourne un objet Filters.
 * Les valeurs invalides sont ignorées (rejetées au profit des défauts).
 */
export function parseFilters(search: URLSearchParams): Filters {
  const result = { ...defaultFilters }

  // q : recherche textuelle
  if (search.has('q')) {
    const q = search.get('q')!.trim()
    if (q) result.q = q
  }

  // periode
  if (search.has('periode')) {
    const p = search.get('periode')!
    if (PERIODE_OPTIONS.includes(p as Periode)) result.periode = p as Periode
  }

  // cat : peut apparaître plusieurs fois → on collecte tous
  const catVals: string[] = []
  for (const key of search.keys()) {
    if (key.startsWith('cat[') || key === 'cat') {
      const v = search.get(key!) || ''
      if (v) catVals.push(v)
    }
  }
  if (catVals.length > 0) result.cat = catVals

  // imp : niveau importance
  if (search.has('imp')) {
    const i = search.get('imp')!
    // on valide simplement que ce n'est pas vide ; les valeurs inattendues deviennent ''
    if (i) result.imp = i
  }

  // pays : plusieurs valeurs (formule ?pays=FR&pays=DE)
  const paysVals: string[] = []
  for (const key of search.keys()) {
    if (key === 'pays') {
      const v = search.get(key)!
      if (v && /^[A-Za-z]{2}$/.test(v)) paysVals.push(v.toUpperCase())
    }
  }
  if (paysVals.length > 0) result.pays = paysVals

  // src : plusieurs valeurs
  const srcVals: string[] = []
  for (const key of search.keys()) {
    if (key === 'src') {
      const v = search.get(key)!
      if (v) srcVals.push(v)
    }
  }
  if (srcVals.length > 0) result.src = srcVals

  // lang : plusieurs valeurs
  const langVals: string[] = []
  for (const key of search.keys()) {
    if (key === 'lang') {
      const v = search.get(key)!
      if (v && /^[A-Za-z]{2,3}$/.test(v)) langVals.push(v.toLowerCase())
    }
  }
  if (langVals.length > 0) result.lang = langVals

  // tri
  if (search.has('tri')) {
    const t = search.get('tri')!
    if (TRI_OPTIONS.includes(t as Tri)) result.tri = t as Tri
  }

  return result
}

/**
 * Sérialise un objet Filters en chaîne de query URL.
 * Utilise les noms de paramètres de la section 12 du DESIGN-SPEC.
 */
export function serializeFilters(filters: Filters): string {
  const params: string[] = []

  if (filters.q && filters.q.length > 0) {
    params.push(`q=${encodeURIComponent(filters.q)}`)
  }

  // periode a défaut '24h' → on ne l'inclut que s'il diffère du défaut
  if (filters.periode !== '24h') {
    params.push(`periode=${encodeURIComponent(filters.periode)}`)
  }

  // cat[] peut apparaître plusieurs fois
  if (filters.cat && filters.cat.length > 0) {
    for (const c of filters.cat) {
      params.push(`cat[]=${encodeURIComponent(c)}`)
    }
  }

  if (filters.imp && filters.imp.length > 0) {
    params.push(`imp=${encodeURIComponent(filters.imp)}`)
  }

  // pays[] codes ISO 2 lettres
  if (filters.pays && filters.pays.length > 0) {
    for (const p of filters.pays) {
      // s'assurer que c'est du 2 lettres
      const code = p.toString().toUpperCase().match(/^[A-Za-z]{2}$/) ? p.toUpperCase() : p
      params.push(`pays[]=${encodeURIComponent(code)}`)
    }
  }

  // src[] plusieurs valeurs
  if (filters.src && filters.src.length > 0) {
    for (const s of filters.src) {
      params.push(`src[]=${encodeURIComponent(s)}`)
    }
  }

  // lang[] codes
  if (filters.lang && filters.lang.length > 0) {
    for (const l of filters.lang) {
      params.push(`lang[]=${encodeURIComponent(l)}`)
    }
  }

  // tri a défaut 'une' → on ne l'inclut que s'il diffère du défaut
  if (filters.tri !== 'une') {
    params.push(`tri=${encodeURIComponent(filters.tri)}`)
  }

  return params.join('&')
}
/** Retourne true si l'histoire tombe dans la période sélectionnée. */
function isWithinPeriod(story: Story, periode: string, now: Date): boolean {
  const eventAt = story.event_at ? new Date(story.event_at) : null
  const lastSourceAt = story.last_source_at ? new Date(story.last_source_at) : null

  // Si aucune date d'événement, on considère que l'histoire est toujours visible
  if (!eventAt && !lastSourceAt) return true

  const eventTime = eventAt ? eventAt.getTime() : 0
  const lastSourceTime = lastSourceAt ? lastSourceAt.getTime() : 0
  const ageHours = (now.getTime() - Math.max(eventTime, lastSourceTime)) / 3_600_000

  switch (periode) {
    case '24h':
      return ageHours <= 24
    case '7j':
      return ageHours <= 24 * 7
    case '1m':
      return ageHours <= 24 * 30
    case '3m':
      return ageHours <= 24 * 90
    case '6m':
      return ageHours <= 24 * 180
    case '1a':
      return ageHours <= 24 * 365
    default:
      return true
  }
}

/**
 * Trie les histoires selon le critère `tri`.
 * Modifie le tableau en place et le retourne.
 */
export function sortStories(stories: Story[], tri: Tri): Story[] {
  const copy = [...stories]
  switch (tri) {
    case 'une':
      copy.sort((a, b) => b.hot_score - a.hot_score)
      break
    case 'recent':
      copy.sort((a, b) => {
        const aDate = new Date(a.event_at || a.first_seen_at).getTime()
        const bDate = new Date(b.event_at || b.first_seen_at).getTime()
        return bDate - aDate
      })
      break
    case 'hot':
      copy.sort((a, b) => b.hot_score - a.hot_score)
      break
    case 'old':
      copy.sort((a, b) => {
        const aDate = new Date(a.event_at || a.first_seen_at).getTime()
        const bDate = new Date(b.event_at || b.first_seen_at).getTime()
        return aDate - bDate
      })
      break
  }
  return copy
}

/**
 * Calcule les facettes (compteurs) à afficher dans le panneau de filtres.
 * Retourne un objet clé-valeur {label, count} pour chaque facette.
 */
export function facets(stories: Story[]): {
  periode: Record<string, number>
  imp: Record<string, number>
  cat: Record<string, number>
  pays: Record<string, number>
  lang: Record<string, number>
} {
  const periodeCounts: Record<string, number> = {
    '24h': 0,

/** Sérialise un objet `Filters` en chaîne de requête (ex: `cat=france,allemagne&pays=FR`). */
export function serializeFilters(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.periode && filters.periode !== '24h') params.append('periode', filters.periode);
  if (filters.cat?.length) params.append('cat', filters.cat.join(','));
  if (filters.imp) params.append('imp', filters.imp);
  if (filters.pays?.length) params.append('pays', filters.pays.join(','));
  if (filters.src?.length) params.append('src', filters.src.join(','));
  if (filters.lang?.length) params.append('lang', filters.lang.join(','));
  if (filters.tri && filters.tri !== 'une') params.append('tri', filters.tri);
  return params.toString();
}

/** Dé-sérialise un objet `Filters` depuis une chaîne de requête ou un URLSearchParams. */
export function parseFilters(input: string | URLSearchParams): Filters {
  const params = typeof input === 'string' ? new URLSearchParams(input) : input;
  const cat = params.getAll('cat').map((v) => decodeURIComponent(v));
  const pays = params.getAll('pays').map((v) => decodeURIComponent(v));
  const src = params.getAll('src').map((v) => decodeURIComponent(v));
  const lang = params.getAll('lang').map((v) => decodeURIComponent(v));
  return {
    q: params.get('q') ?? '',
    periode: params.get('periode') ?? '24h',
    cat: cat.length > 0 ? cat : [],
    imp: params.get('imp') ?? '',
    pays: pays.length > 0 ? pays : [],
    src: src.length > 0 ? src : [],
    lang: lang.length > 0 ? lang : [],
    tri: params.get('tri') ?? 'une',
  };
}

/**
 * Calcule les facettes (comptages par période, importance, catégorie, pays, langue)
 * à partir d'une liste d'histoires.
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
  const impCounts: Record<string, number> = { essential: 0, important: 0, follow: 0, brief: 0 }
  const catCounts: Record<string, number> = {}
  const paysCounts: Record<string, number> = {}
  const langCounts: Record<string, number> = {}

  for (const story of stories) {
    const eventAt = story.event_at ? new Date(story.event_at) : null
    const lastSourceAt = story.last_source_at ? new Date(story.last_source_at) : null
    const eventTime = eventAt ? eventAt.getTime() : 0
    const lastSourceTime = lastSourceAt ? lastSourceAt.getTime() : 0
    const ageHours = eventAt || lastSourceAt
      ? (new Date().getTime() - Math.max(eventTime, lastSourceTime)) / 3_600_000
      : 0

    if (ageHours <= 24) periodeCounts['24h'] = (periodeCounts['24h'] ?? 0) + 1
    else if (ageHours <= 24 * 7) periodeCounts['7j'] = (periodeCounts['7j'] ?? 0) + 1
    else if (ageHours <= 24 * 30) periodeCounts['1m'] = (periodeCounts['1m'] ?? 0) + 1
    else if (ageHours <= 24 * 90) periodeCounts['3m'] = (periodeCounts['3m'] ?? 0) + 1
    else if (ageHours <= 24 * 180) periodeCounts['6m'] = (periodeCounts['6m'] ?? 0) + 1
    else periodeCounts['1a'] = (periodeCounts['1a'] ?? 0) + 1

    if (story.importance >= 85) impCounts['essential'] = (impCounts['essential'] ?? 0) + 1
    else if (story.importance >= 65) impCounts['important'] = (impCounts['important'] ?? 0) + 1
    else if (story.importance >= 40) impCounts['follow'] = (impCounts['follow'] ?? 0) + 1
    else impCounts['brief'] = (impCounts['brief'] ?? 0) + 1

    const cat = story.category
    catCounts[cat] = (catCounts[cat] ?? 0) + 1

    for (const c of story.countries || []) {
      paysCounts[c] = (paysCounts[c] ?? 0) + 1
    }

    for (const l of story.languages || []) {
      langCounts[l] = (langCounts[l] ?? 0) + 1
    }
  }

  return { periode: periodeCounts, imp: impCounts, cat: catCounts, pays: paysCounts, lang: langCounts }
}

# Fix malformed facets function
