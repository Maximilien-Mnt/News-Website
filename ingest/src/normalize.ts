import { createHash } from 'node:crypto';
import type { FeedItem, RawArticle } from './types';

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: '\u00A0',
  iexcl: '\u00A1',
  cent: '\u00A2',
  pound: '\u00A3',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  eacute: 'é',
  egrave: 'è',
  ecirc: 'ê',
  euml: 'ë',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  auml: 'ä',
  aring: 'å',
  aelig: 'æ',
  ccedil: 'ç',
  ntilde: 'ñ',
  ograve: 'ò',
  oacute: 'ó',
  ocirc: 'ô',
  ouml: 'ö',
  oslash: 'ø',
  ugrave: 'ù',
  uacute: 'ú',
  ucirc: 'û',
  uuml: 'ü',
  yacute: 'ý',
  yuml: 'ÿ',
  iquest: '¿',
  euro: '€',
  trade: '™',
  copy: '©',
  reg: '®',
  plusmn: '±',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
  bull: '•',
};

export function decodeHTMLEntities(text: string): string {
  return text.replace(
    /&(#\d+|#x[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (_match, entity) => {
      if (entity.startsWith('#')) {
        const code = entity.startsWith('#x')
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
        return isNaN(code) ? `&${entity};` : String.fromCodePoint(code);
      }
      return NAMED_ENTITIES[entity] ?? `&${entity};`;
    },
  );
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:<\/script>|$)/gi, ' ')
    .replace(/<style\b[^<]*(?:<\/style>|$)/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;!?])/g, '$1')
    .trim();
}

export function canonicalUrl(url: string): string {
  const u = new URL(url);
  for (const key of [...u.searchParams.keys()]) {
    if (/^utm_/i.test(key)) u.searchParams.delete(key);
  }
  u.hash = '';
  let pathname = u.pathname.replace(/\/+/g, '/');
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }
  u.pathname = pathname;
  return u.toString();
}

export function urlHash(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

export function cleanTitle(title: string): string {
  return decodeHTMLEntities(title ?? '').replace(/\s+/g, ' ').trim();
}

export function snippet(text: string): string {
  const plain = stripHtml(text ?? '');
  if (plain.length <= 500) return plain;
  return plain.slice(0, 500).trim();
}

const STOPWORDS_FR = new Set([
  'le','la','les','un','une','des','du','de','l','d','et','ou','en','au','aux',
  'avec','pour','sur','par','dans','que','qui','ne','pas','plus','très','bien',
  'comme','son','sa','ses','cette','ces','cet','mon','ma','mes','ton','ta','tes',
  'notre','votre','leurs','y','a','est','sont','été','être','avoir','fait','faire',
  'ils','elles','nous','vous','je','tu','il','elle','on','ce','se','me','te','leur',
  'sans','sous','vers','chez','rien','tout','tous','toute','toutes','autre','autres',
  'certain','certains','certaine','certaines','tel','tels','telle','telles','si',
  'car','donc','alors','depuis','pendant','avant','après','maintenant','ici','là',
]);

const STOPWORDS_EN = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by',
  'from','as','is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','can','must','shall',
  'this','that','these','those','i','you','he','she','it','we','they','me','him',
  'her','us','them','my','your','his','its','our','their','not','no','yes','if',
  'then','else','when','where','why','how','what','which','who','whom','there',
  'here','now','today','just','also','only','very','too','much','many','more',
  'most','some','any','such','own','same','so','than','into','about','after',
  'before','between','under','again',
]);

export function titleTokens(title: string): string[] {
  const t = decodeHTMLEntities(title ?? '').toLowerCase();
  const noAccents = t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const tokens = noAccents.split(/[\s,;.!?:()""''«»\-—/]+/).filter(Boolean);
  return tokens.filter(
    (tok) => !STOPWORDS_FR.has(tok) && !STOPWORDS_EN.has(tok),
  );
}

export function normalizeItem(
  item: FeedItem,
  sourceId: number,
  sourceLanguage: string,
): RawArticle {
  const canon = canonicalUrl(item.url);
  return {
    source_id: sourceId,
    url: canon,
    url_hash: urlHash(canon),
    title: cleanTitle(item.title),
    snippet: snippet(item.snippet),
    language: sourceLanguage,
    published_at: item.publishedAt,
    title_tokens: titleTokens(item.title),
  };
}