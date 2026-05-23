import { useQuery, useQueries } from '@tanstack/react-query';
import { getStandings, getTeamSquad } from '@/lib/bzzoiro/endpoints';
import type { SquadPlayer, StandingEntry } from '@/lib/bzzoiro/types';

export interface EnrichedPlayer extends SquadPlayer {
  team_id: number;
  team_name: string;
}

// ── Standings ─────────────────────────────────────────────────────────────────

export function useLeagueStandings(leagueId: number) {
  return useQuery({
    queryKey: ['league-standings', leagueId],
    queryFn: () => getStandings(leagueId),
    staleTime: 1000 * 60 * 60 * 24,
  });
}

// ── Progressive players ───────────────────────────────────────────────────────
// One query per team squad → players stream in team-by-team as each resolves.

export interface ProgressivePlayersResult {
  players: EnrichedPlayer[];   // all players collected so far
  isLoading: boolean;          // true while standings or any squad is still loading
  teamsTotal: number;          // how many teams in the league
  teamsLoaded: number;         // how many squad fetches completed
  error: Error | null;
}

export function useLeaguePlayers(leagueId: number): ProgressivePlayersResult {
  // Step 1: standings (gives us team list)
  const standingsQuery = useLeagueStandings(leagueId);
  const teams: StandingEntry[] = standingsQuery.data?.standings ?? [];

  // Step 2: one squad query per team — fires as soon as team list is known
  const squadQueries = useQueries({
    queries: teams.map((entry) => ({
      queryKey: ['team-squad', entry.team_id],
      queryFn: async (): Promise<EnrichedPlayer[]> => {
        const squad = await getTeamSquad(entry.team_id);
        return squad.players.map((p: SquadPlayer) => ({
          ...p,
          team_id: entry.team_id,
          team_name: entry.team_name,
        }));
      },
      staleTime: 1000 * 60 * 60 * 24,
      enabled: !standingsQuery.isLoading,
    })),
  });

  // Collect results from whichever queries have resolved already
  const players: EnrichedPlayer[] = [];
  let teamsLoaded = 0;
  let firstError: Error | null = null;

  for (const q of squadQueries) {
    if (q.status === 'success' && q.data) {
      players.push(...q.data);
      teamsLoaded++;
    } else if (q.status === 'error' && !firstError) {
      firstError = q.error as Error;
      teamsLoaded++; // count it as "done" even if errored
    }
  }

  const teamsTotal = teams.length;
  const allSquadsDone = teamsTotal > 0 && teamsLoaded >= teamsTotal;
  const isLoading = standingsQuery.isLoading || (teamsTotal > 0 && !allSquadsDone);

  return { players, isLoading, teamsTotal, teamsLoaded, error: firstError };
}
