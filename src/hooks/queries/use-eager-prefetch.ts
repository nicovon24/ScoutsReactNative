import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPlayerStats, getPlayerDetail } from '@/lib/bzzoiro/endpoints';
import type { EnrichedPlayer } from './use-league';
import type { AggregatedStats, Player, PlayerStats } from '@/lib/bzzoiro/types';
import type { PaginatedResponse } from '@/lib/bzzoiro/types';

// Aggregate stats inline (duplicated from use-player-detail to avoid circular deps)
function aggregateStats(stats: PlayerStats[]): AggregatedStats {
  if (stats.length === 0) {
    return { goals: 0, assists: 0, xG: 0, xA: 0, avgRating: 0, matches: 0, tackles: 0, interceptions: 0, clearances: 0, keyPasses: 0, saves: 0, goalsConceded: 0, cleanSheets: 0 };
  }
  const totals = stats.reduce(
    (acc, s) => ({
      goals: acc.goals + s.goals,
      assists: acc.assists + s.goal_assist,
      xG: acc.xG + (s.expected_goals ?? 0),
      xA: acc.xA + (s.expected_assists ?? 0),
      ratingSum: acc.ratingSum + (s.rating ?? 0),
      ratingCount: acc.ratingCount + (s.rating != null ? 1 : 0),
      tackles: acc.tackles + s.total_tackle,
      interceptions: acc.interceptions + s.interception,
      clearances: acc.clearances + s.total_clearance,
      keyPasses: acc.keyPasses + s.key_pass,
      saves: acc.saves + s.saves,
      goalsConceded: acc.goalsConceded + s.goals_conceded,
      cleanSheets: acc.cleanSheets + (s.goals_conceded === 0 ? 1 : 0),
    }),
    { goals: 0, assists: 0, xG: 0, xA: 0, ratingSum: 0, ratingCount: 0, tackles: 0, interceptions: 0, clearances: 0, keyPasses: 0, saves: 0, goalsConceded: 0, cleanSheets: 0 },
  );
  return {
    goals: totals.goals,
    assists: totals.assists,
    xG: Math.round(totals.xG * 10) / 10,
    xA: Math.round(totals.xA * 10) / 10,
    avgRating: totals.ratingCount > 0 ? Math.round((totals.ratingSum / totals.ratingCount) * 10) / 10 : 0,
    matches: stats.length,
    tackles: totals.tackles,
    interceptions: totals.interceptions,
    clearances: totals.clearances,
    keyPasses: totals.keyPasses,
    saves: totals.saves,
    goalsConceded: totals.goalsConceded,
    cleanSheets: totals.cleanSheets,
  };
}

const CONCURRENCY = 8; // parallel requests at a time

export interface PrefetchState {
  done: boolean;
  total: number;
  loaded: number;
}

/**
 * Eagerly pre-fetches stats + detail for all players in the list.
 * Respects the React Query cache — skips players whose data is already cached.
 * Returns progress so the UI can show a skeleton until done.
 */
export function useEagerPrefetch(players: EnrichedPlayer[] | undefined): PrefetchState {
  const queryClient = useQueryClient();
  const [state, setState] = useState<PrefetchState>({ done: false, total: 0, loaded: 0 });
  const runningRef = useRef<string | null>(null);

  useEffect(() => {
    if (!players || players.length === 0) {
      setState({ done: true, total: 0, loaded: 0 });
      return;
    }

    // Filter only players not already cached
    const missing = players.filter(
      (p) =>
        !queryClient.getQueryData<{ aggregated: AggregatedStats }>(['player-stats', p.id]) ||
        !queryClient.getQueryData<Player>(['player-detail', p.id]),
    );

    if (missing.length === 0) {
      setState({ done: true, total: players.length, loaded: players.length });
      return;
    }

    const runId = String(Date.now());
    runningRef.current = runId;

    let loaded = players.length - missing.length; // already cached count
    const total = players.length;

    setState({ done: false, total, loaded });

    async function runQueue(items: EnrichedPlayer[]) {
      let i = 0;

      async function next() {
        while (i < items.length) {
          if (runningRef.current !== runId) return;
          const player = items[i++];

          await Promise.allSettled([
            queryClient.fetchQuery({
              queryKey: ['player-stats', player.id],
              queryFn: async () => {
                const data = await getPlayerStats(player.id, 100);
                return { raw: data.results, aggregated: aggregateStats(data.results) };
              },
              staleTime: 1000 * 60 * 60 * 24,
            }),
            queryClient.fetchQuery({
              queryKey: ['player-detail', player.id],
              queryFn: () => getPlayerDetail(player.id),
              staleTime: 1000 * 60 * 60 * 24,
            }),
          ]);

          if (runningRef.current !== runId) return;
          loaded += 1;
          const isDone = loaded >= total;
          setState({ done: isDone, total, loaded });
        }
      }

      // Run CONCURRENCY workers in parallel
      await Promise.allSettled(
        Array.from({ length: Math.min(CONCURRENCY, items.length) }, next),
      );
    }

    runQueue(missing);

    return () => {
      runningRef.current = null;
    };
  }, [players, queryClient]);

  return state;
}
