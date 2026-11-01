import { useCallback, useEffect, useState } from 'react';
import { useFilters } from '../lib/useFilters';
import { supabaseConfigured } from '../lib/supabase';
import { type Story } from '../lib/types';
import { type Filters } from '../lib/filters';
import {
  fetchStories,
  fetchFacets,
  type Facets,
} from '../lib/api';
import { defaultFilters } from '../lib/filters';
import StoryList from './StoryList';
import StoryListSkeleton from './StoryListSkeleton';
import { FilterPanel } from '../lib/FilterPanel';
import { ActiveFilters } from '../lib/ActiveFilters';

export function FeedClient() {
  const { filters, updateFilter, resetFilters } = useFilters();
  const [stories, setStories] = useState<Story[]>([]);
  const [facets, setFacets] = useState<Facets | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(
    async (p: number) => {
      setLoading(true);
      setError(null);
      const result = await fetchStories(filters, p);
      if (!result.ok) {
        setError(result.error.message);
        setLoading(false);
        return;
      }
      setStories(result.data);
      setPage(p);
      setTotalPages(result.totalPages);
      setLoading(false);
    },
    [filters],
  );

  useEffect(() => {
    loadPage(1);
  }, [loadPage]);

  useEffect(() => {
    loadPage(1);
  }, [filters]);

  const loadFacets = useCallback(async () => {
    const result = await fetchFacets(filters);
    if (result.ok && result.facets) setFacets(result.facets);
  }, [filters]);

  useEffect(() => {
    loadFacets();
  }, [loadFacets]);

  const loadMore = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    setError(null);
    const result = await fetchStories(filters, page + 1);
    setLoadingMore(false);
    if (!result.ok) {
      setError(result.error.message);
      return;
    }
    setStories((prev) => [...prev, ...result.data]);
    setPage((p) => p + 1);
    setTotalPages(result.totalPages);
  }, [filters, page, loadingMore]);

  const handleFilterRemove = (key: string) => {
    updateFilter(key as keyof Filters, defaultFilters[key as keyof typeof defaultFilters]);
  };

  return (
    <>
      {!supabaseConfigured && (
        <p
          role="status"
          style={{
            margin: 0,
            padding: '8px 12px',
            background: 'var(--c-ink)',
            color: 'var(--c-paper)',
            fontSize: '0.8125rem',
            borderBottom: '1px solid var(--c-line)',
          }}
        >
          Données factices — aucune variable Supabase publique configurée.
        </p>
      )}
      <FilterPanel facets={facets ?? { periode: { '24h': 0, '7j': 0, '1m': 0, '3m': 0, '6m': 0, '1a': 0 }, imp: { essential: 0, important: 0, follow: 0, brief: 0 }, cat: {}, pays: {}, lang: {} } as Facets} storiesCount={stories.length} onReset={resetFilters} />
      <ActiveFilters onFilterRemove={handleFilterRemove} onReset={resetFilters} />
      {loading ? (
        <StoryListSkeleton count={6} />
      ) : error ? (
        <div
          role="alert"
          style={{
            padding: '12px',
            margin: '8px 0 0',
            background: 'var(--c-surface)',
            border: '1px solid var(--c-danger)',
            borderRadius: '4px',
            color: 'var(--c-danger)',
            fontSize: '0.9375rem',
          }}
        >
          {error}
          <button
            onClick={() => loadPage(1)}
            style={{
              marginLeft: '12px',
              padding: '4px 12px',
              borderRadius: '4px',
              border: '1px solid var(--c-accent)',
              background: 'var(--c-accent)',
              color: 'var(--c-accent-ink)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            Réessayer
          </button>
        </div>
      ) : (
        <StoryList stories={stories} onLoadMore={loading ? undefined : loadMore} />
      )}
      {!loading && !error && stories.length > 0 && page < totalPages && (
        <div style={{ textAlign: 'center', margin: '24px 0 0' }}>
          <button
            onClick={loadMore}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: '1px solid var(--c-accent)',
              background: 'var(--c-accent)',
              color: 'var(--c-accent-ink)',
              cursor: 'pointer',
              fontSize: '0.9375rem',
            }}
          >
            Charger plus de brèves
          </button>
        </div>
      )}
    </>
  );
}

export default FeedClient;
