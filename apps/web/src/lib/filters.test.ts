import { describe, expect, it } from 'vitest';
import {
  defaultFilters,
  parseFilters,
  serializeFilters,
  type Filters,
} from './filters';
import { buildStoriesParams, orderFor } from './api';

describe('serializeFilters / parseFilters', () => {
  it('retourne une chaîne vide pour les filtres par défaut', () => {
    expect(serializeFilters(defaultFilters)).toBe('');
  });

  it('sérialise l\'objet de recherche', () => {
    expect(serializeFilters({ ...defaultFilters, q: 'eau' })).toBe('q=eau');
  });

  it('sérialise les tableaux sous forme de chaînes séparées par des virgules', () => {
    expect(
      serializeFilters({
        ...defaultFilters,
        periode: '7j',
        pays: ['FR', 'CH'],
        lang: ['fr'],
      }),
    ).toBe('periode=7j&pays=FR,CH&lang=fr');
  });

  it('arrondit la sérialisation', () => {
    const input: Filters = {
      q: 'eau',
      periode: '1m',
      cat: ['Science'],
      imp: 'important',
      pays: ['FR'],
      src: ['Le Monde', 'BBC'],
      lang: ['fr', 'en'],
      tri: 'recent',
    };
    expect(parseFilters(serializeFilters(input))).toEqual(input);
  });
});

describe('buildStoriesParams', () => {
  const now = new Date('2026-10-31T12:00:00Z');

  it('ne fait aucun filtre pour les filtres par défaut (tri=une)', () => {
    expect(buildStoriesParams(defaultFilters, now)).toEqual({ order: 'hot_score.desc' });
  });

  it('souhaite last_source_at pour tri="recent"', () => {
    const params = buildStoriesParams({ ...defaultFilters, tri: 'recent' }, now);
    expect(params.order).toBe('last_source_at.desc.nullslast');
  });

  it('traduit periode en seuil last_source_at', () => {
    const params = buildStoriesParams({ ...defaultFilters, periode: '24h' }, now);
    expect(params['last_source_at.gte']).toBeDefined();
    expect(typeof params['last_source_at.gte']).toBe('string');
  });

  it('traduit catégorie avec in', () => {
    const params = buildStoriesParams({ ...defaultFilters, cat: ['monde', 'economie'] });
    expect(params.category).toBe('in.(monde,economie)');
  });

  it('traduit importance avec gte', () => {
    expect(buildStoriesParams({ ...defaultFilters, imp: 'important' }).importance).toBe('gte.65');
    expect(buildStoriesParams({ ...defaultFilters, imp: 'essential' }).importance).toBe('gte.85');
  });

  it('traduit importance "brief" avec lt.40', () => {
    expect(buildStoriesParams({ ...defaultFilters, imp: 'brief' }).importance).toBe('lt.40');
  });

  it('traduit pays avec ov', () => {
    expect(buildStoriesParams({ ...defaultFilters, pays: ['FR', 'CH'] }).countries).toBe('ov.{FR,CH}');
  });

  it('traduit langue avec ov', () => {
    expect(buildStoriesParams({ ...defaultFilters, lang: ['fr', 'en'] }).languages).toBe('ov.{fr,en}');
  });

  it('traduit source avec cs sur le domaine', () => {
    expect(buildStoriesParams({ ...defaultFilters, src: ['bbc-world'] }).sources).toBe(
      'cs.[{"domain":"bbc-world"}]',
    );
  });

  it('échappe le motif de recherche pour ilike', () => {
    const params = buildStoriesParams({ ...defaultFilters, q: '100%' });
    expect(params.or).toBe('headline.ilike.*.100\\% ,summary.ilike.*.100\\%');
  });

  it('ordre pour chaque valeur de tri', () => {
    expect(orderFor('une').column).toBe('hot_score');
    expect(orderFor('hot').column).toBe('hot_score');
    expect(orderFor('recent').column).toBe('last_source_at');
    expect(orderFor('old').column).toBe('last_source_at');
    expect(orderFor('important').column).toBe('importance');
    expect(orderFor('sources').column).toBe('source_count');
  });
});
