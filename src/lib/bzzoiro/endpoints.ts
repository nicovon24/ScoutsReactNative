import { bzzoiroFetch } from './client';
import type {
  League,
  PaginatedResponse,
  Player,
  PlayerStats,
  SquadResponse,
  StandingsResponse,
} from './types';

export const LEAGUES = [
  { id: 1,  name: 'Premier League', country: 'England' },
  { id: 3,  name: 'La Liga',        country: 'Spain'   },
  { id: 4,  name: 'Serie A',        country: 'Italy'   },
  { id: 5,  name: 'Bundesliga',     country: 'Germany' },
  { id: 6,  name: 'Ligue 1',        country: 'France'  },
] as const;

export type LeagueId = (typeof LEAGUES)[number]['id'];
export const PREMIER_LEAGUE_ID: LeagueId = 1;

export async function listLeagues(): Promise<PaginatedResponse<League>> {
  return bzzoiroFetch<PaginatedResponse<League>>('/leagues/');
}

export async function getStandings(leagueId: number = PREMIER_LEAGUE_ID): Promise<StandingsResponse> {
  return bzzoiroFetch<StandingsResponse>(`/leagues/${leagueId}/standings/`);
}

export async function getTeamSquad(teamId: number): Promise<SquadResponse> {
  return bzzoiroFetch<SquadResponse>(`/teams/${teamId}/squad/`);
}

export async function getPlayerDetail(playerId: number): Promise<Player> {
  return bzzoiroFetch<Player>(`/players/${playerId}/`);
}

export async function getPlayerStats(
  playerId: number,
  limit = 50,
): Promise<PaginatedResponse<PlayerStats>> {
  return bzzoiroFetch<PaginatedResponse<PlayerStats>>(
    `/players/${playerId}/stats/?limit=${limit}`,
  );
}
