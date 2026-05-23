import { useQuery } from '@tanstack/react-query';
import { getPlayerDetail, getPlayerStats } from '@/lib/bzzoiro/endpoints';
import type { AggregatedStats, PlayerStats } from '@/lib/bzzoiro/types';

export function usePlayerDetail(playerId: number) {
  return useQuery({
    queryKey: ['player-detail', playerId],
    queryFn: () => getPlayerDetail(playerId),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: playerId > 0,
  });
}

const EMPTY_STATS: AggregatedStats = {
  goals: 0, assists: 0, xG: 0, xA: 0, avgRating: 0, matches: 0,
  tackles: 0, interceptions: 0, clearances: 0, keyPasses: 0,
  saves: 0, goalsConceded: 0, cleanSheets: 0,
};

function aggregateStats(stats: PlayerStats[]): AggregatedStats {
  if (stats.length === 0) return EMPTY_STATS;

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
    {
      goals: 0, assists: 0, xG: 0, xA: 0, ratingSum: 0, ratingCount: 0,
      tackles: 0, interceptions: 0, clearances: 0, keyPasses: 0,
      saves: 0, goalsConceded: 0, cleanSheets: 0,
    },
  );

  return {
    goals: totals.goals,
    assists: totals.assists,
    xG: Math.round(totals.xG * 10) / 10,
    xA: Math.round(totals.xA * 10) / 10,
    avgRating:
      totals.ratingCount > 0
        ? Math.round((totals.ratingSum / totals.ratingCount) * 10) / 10
        : 0,
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

export function usePlayerStats(playerId: number) {
  return useQuery({
    queryKey: ['player-stats', playerId],
    queryFn: async () => {
      const data = await getPlayerStats(playerId, 100);
      return {
        raw: data.results,
        aggregated: aggregateStats(data.results),
      };
    },
    staleTime: 1000 * 60 * 60,
    enabled: playerId > 0,
  });
}
