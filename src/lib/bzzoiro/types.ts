export interface League {
  id: number;
  name: string;
  country: string;
  is_women: boolean;
  is_active: boolean;
  current_season: Season | null;
}

export interface Season {
  id: number;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface StandingEntry {
  position: number;
  team_id: number;
  team_name: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  xgf: number;
  xga: number;
  xgd: number;
  xg_games: number;
  form: string;
  live: boolean;
}

export interface StandingsResponse {
  league_id: number;
  season: Season;
  grouped: boolean;
  standings: StandingEntry[];
}

export interface SquadPlayer {
  id: number;
  name: string;
  short_name: string;
  position: 'G' | 'D' | 'M' | 'F' | '';
  jersey_number: number | null;
  nationality: string;
  date_of_birth: string | null;
}

export interface SquadResponse {
  team_id: number;
  count: number;
  players: SquadPlayer[];
}

export interface Player {
  id: number;
  name: string;
  short_name: string;
  position: 'G' | 'D' | 'M' | 'F' | '';
  specific_position: string;
  jersey_number: number | null;
  date_of_birth: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  preferred_foot: string;
  nationality: string;
  current_team_id: number | null;
  national_team_id: number | null;
  market_value_eur: number | null;
  contract_until: string | null;
  availability: string;
  /** Enriched by the app — not from API */
  team_name?: string;
}

export interface PlayerStats {
  id: number;
  player_id: number;
  event_id: number;
  team_id: number;
  minutes_played: number;
  rating: number | null;
  touches: number;
  goals: number;
  goal_assist: number;
  expected_goals: number | null;
  expected_assists: number | null;
  total_shots: number;
  shots_on_target: number;
  key_pass: number;
  total_pass: number;
  accurate_pass: number;
  total_long_balls: number;
  accurate_long_balls: number;
  total_cross: number;
  accurate_cross: number;
  total_contest: number;
  won_contest: number;
  duel_won: number;
  duel_lost: number;
  aerial_won: number;
  aerial_lost: number;
  total_tackle: number;
  won_tackle: number;
  total_clearance: number;
  interception: number;
  ball_recovery: number;
  blocked_scoring_attempt: number;
  dispossessed: number;
  possession_lost: number;
  was_fouled: number;
  fouls: number;
  yellow_card: number;
  red_card: number;
  saves: number;
  goals_conceded: number;
  punches: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Position = 'G' | 'D' | 'M' | 'F';

export interface AggregatedStats {
  goals: number;
  assists: number;
  xG: number;
  xA: number;
  avgRating: number;
  matches: number;
  tackles: number;
  interceptions: number;
  clearances: number;
  keyPasses: number;
  saves: number;
  goalsConceded: number;
  cleanSheets: number;
}
