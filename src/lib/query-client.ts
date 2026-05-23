import { QueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

const CACHE_KEY = 'bzzoiro_query_cache_v1';
const CACHE_MAX_AGE_MS = 1000 * 60 * 60 * 24; // 24h

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24h — never re-fetch on mount if data exists
      gcTime: 1000 * 60 * 60 * 48,    // 48h — keep in memory
      retry: 1,
    },
  },
});

// ── localStorage persistence (web only) ─────────────────────────────────────

function canPersist() {
  return Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/** Restore cache from localStorage on app init */
export function restoreCache() {
  if (!canPersist()) return;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const { ts, queries } = JSON.parse(raw) as { ts: number; queries: Array<{ key: unknown[]; data: unknown; updatedAt: number }> };
    if (Date.now() - ts > CACHE_MAX_AGE_MS) {
      localStorage.removeItem(CACHE_KEY);
      return;
    }
    for (const { key, data, updatedAt } of queries) {
      // Only restore if the query is not already in the cache
      if (!queryClient.getQueryData(key)) {
        queryClient.setQueryData(key, data, { updatedAt });
      }
    }
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
}

/** Persist current cache snapshot to localStorage */
export function persistCache() {
  if (!canPersist()) return;
  try {
    const queries = queryClient
      .getQueryCache()
      .getAll()
      .filter((q) => q.state.status === 'success' && q.state.data !== undefined)
      .map((q) => ({
        key: q.queryKey,
        data: q.state.data,
        updatedAt: q.state.dataUpdatedAt,
      }));

    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), queries }),
    );
  } catch {
    // localStorage full or unavailable — ignore
  }
}

/** Set up auto-persist: save 2s after last query update */
export function setupCachePersistence() {
  if (!canPersist()) return;
  let timer: ReturnType<typeof setTimeout>;
  queryClient.getQueryCache().subscribe(() => {
    clearTimeout(timer);
    timer = setTimeout(persistCache, 2000);
  });
}
