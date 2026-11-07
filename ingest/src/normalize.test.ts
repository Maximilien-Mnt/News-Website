import { describe, it, expect } from 'vitest';
import {
  canonicalUrl,
  cleanTitle,
  decodeHTMLEntities,
  snippet,
  titleTokens,
  urlHash,
} from './normalize';

describe('canonicalUrl', () => {
  it('removes utm_* query params', () => {
    expect(
      canonicalUrl('https://lemonde.fr/article?utm_source=rss&foo=bar#section'),
    ).toBe('https://lemonde.fr/article?foo=bar');
  });

  it('removes fragment', () => {
    expect(canonicalUrl('https://example.com/page#section')).toBe(
      'https://example.com/page',
    );
  });

  it('removes trailing slash except root', () => {
    expect(canonicalUrl('https://example.com/page/')).toBe(
      'https://example.com/page',
    );
    expect(canonicalUrl('https://example.com/')).toBe('https://example.com/');
  });

  it('keeps non-utm params', () => {
    expect(canonicalUrl('https://example.com/page?campaign=x&utm_id=1')).toBe(
      'https://example.com/page?campaign=x',
    );
  });
});

describe('urlHash', () => {
  it('is deterministic', () => {
    const u = canonicalUrl('https://example.com/article');
    expect(urlHash(u)).toBe(urlHash(u));
  });

  it('is 64 hex chars', () => {
    expect(urlHash(canonicalUrl('https://example.com/article'))).toMatch(
      /^[0-9a-f]{64}$/,
    );
  });

  it('differs for different urls', () => {
    expect(
      urlHash(canonicalUrl('https://example.com/a')),
    ).not.toBe(urlHash(canonicalUrl('https://example.com/b')));
  });
});

describe('decodeHTMLEntities', () => {
  it('decodes named and numeric entities', () => {
    expect(decodeHTMLEntities('Titre &amp; entit&eacute;s')).toBe(
      'Titre & entités',
    );
    expect(decodeHTMLEntities('&#8217;s &amp; &#x2026;')).toBe("’s & …");
  });
});

describe('cleanTitle', () => {
  it('decodes entities and collapses whitespace', () => {
    expect(cleanTitle('  Bonjour   &eacute;  ')).toBe('Bonjour é');
  });
});

describe('snippet', () => {
  it('strips HTML', () => {
    expect(snippet('<p>Un <b>extrait</b>.</p>')).toBe('Un extrait.');
  });

  it('truncates to 500 characters', () => {
    const long = 'x'.repeat(600);
    expect(snippet(long)).toHaveLength(500);
  });

  it('returns null-ish input as empty', () => {
    expect(snippet('')).toBe('');
  });
});

describe('titleTokens', () => {
  it('lowercases, removes accents and stopwords fr/en', () => {
    expect(titleTokens('Le Président a signé un accord')).toEqual([
      'president', 'signe', 'accord',
    ]);
  });

  it('ignores accents in comparison', () => {
    expect(titleTokens('café')).toEqual(['cafe']);
  });

  it('returns empty for stopwords only', () => {
    expect(titleTokens('le la the a')).toEqual([]);
  });
});