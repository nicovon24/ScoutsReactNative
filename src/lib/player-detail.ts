import type { AggregatedStats, Player, PlayerStats, Position } from './bzzoiro/types';

// ── Formatting ────────────────────────────────────────────────────────────────

export function formatMarketValue(eur: number | null | undefined): string {
  if (eur == null) return 'N/D';
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (eur >= 1_000) return `€${Math.round(eur / 1_000)}K`;
  return `€${eur}`;
}

export function getAge(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

export function ratingColor(r: number): string {
  if (r >= 7.5) return '#64ffda';
  if (r >= 7.0) return '#E8A838';
  return '#717171';
}

// ── Quick stats bar (hero) ────────────────────────────────────────────────────

export interface QuickStat {
  label: string;
  value: string | number;
  accent?: string;
}

export function getQuickStats(position: Position | '', stats: AggregatedStats, marketValue: number | null): QuickStat[] {
  const valor = formatMarketValue(marketValue);
  if (position === 'G') {
    return [
      { label: 'PJ',          value: stats.matches },
      { label: 'Arcos 0',     value: stats.cleanSheets,    accent: '#64ffda' },
      { label: 'Paradas',     value: stats.saves,          accent: '#60a5fa' },
      { label: 'Valor',       value: valor,                accent: '#E8A838' },
    ];
  }
  if (position === 'D') {
    return [
      { label: 'PJ',          value: stats.matches },
      { label: 'Tackles',     value: stats.tackles,        accent: '#E8A838' },
      { label: 'Interc.',     value: stats.interceptions,  accent: '#64ffda' },
      { label: 'Valor',       value: valor,                accent: '#E8A838' },
    ];
  }
  if (position === 'M') {
    return [
      { label: 'PJ',          value: stats.matches },
      { label: 'G+A',         value: stats.goals + stats.assists, accent: '#64ffda' },
      { label: 'xG',          value: stats.xG,             accent: '#60a5fa' },
      { label: 'Valor',       value: valor,                accent: '#E8A838' },
    ];
  }
  // F or unknown
  return [
    { label: 'PJ',            value: stats.matches },
    { label: 'Goles',         value: stats.goals,          accent: '#64ffda' },
    { label: 'Asist',         value: stats.assists,        accent: '#60a5fa' },
    { label: 'Valor',         value: valor,                accent: '#E8A838' },
  ];
}

// ── Key stats 2×2 grid (detalles card) ───────────────────────────────────────

export interface KeyStat {
  label: string;
  value: string | number;
  accent: string;
}

export function getKeyStats(position: Position | '', stats: AggregatedStats, raw: PlayerStats[]): KeyStat[] {
  // Derived ratios from raw per-match data
  const totalShots    = raw.reduce((s, r) => s + r.total_shots, 0);
  const onTarget      = raw.reduce((s, r) => s + r.shots_on_target, 0);
  const totalPass     = raw.reduce((s, r) => s + r.total_pass, 0);
  const accPass       = raw.reduce((s, r) => s + r.accurate_pass, 0);
  const duelWon       = raw.reduce((s, r) => s + r.duel_won, 0);
  const duelLost      = raw.reduce((s, r) => s + r.duel_lost, 0);
  const aerialWon     = raw.reduce((s, r) => s + r.aerial_won, 0);
  const aerialLost    = raw.reduce((s, r) => s + r.aerial_lost, 0);

  const shotsPct  = totalShots > 0 ? Math.round((onTarget / totalShots) * 100) : 0;
  const passPct   = totalPass  > 0 ? Math.round((accPass  / totalPass)  * 100) : 0;
  const duelPct   = (duelWon + duelLost) > 0 ? Math.round((duelWon / (duelWon + duelLost)) * 100) : 0;
  const aerialPct = (aerialWon + aerialLost) > 0 ? Math.round((aerialWon / (aerialWon + aerialLost)) * 100) : 0;

  if (position === 'G') return [
    { label: 'Arcos en cero', value: stats.cleanSheets,       accent: '#64ffda'  },
    { label: 'Paradas',       value: stats.saves,             accent: '#60a5fa'  },
    { label: 'Goles enc.',    value: stats.goalsConceded,     accent: '#F04444'  },
    { label: 'Duelos %',      value: `${duelPct}%`,           accent: '#B8B8B8'  },
  ];
  if (position === 'D') return [
    { label: 'Tackles',       value: stats.tackles,           accent: '#E8A838'  },
    { label: 'Interc.',       value: stats.interceptions,     accent: '#64ffda'  },
    { label: 'Recuper.',      value: stats.clearances,        accent: '#60a5fa'  },
    { label: 'Duelos aéreos', value: `${aerialPct}%`,         accent: '#B8B8B8'  },
  ];
  if (position === 'M') return [
    { label: 'Asistencias',   value: stats.assists,           accent: '#64ffda'  },
    { label: 'Pases clave',   value: stats.keyPasses,         accent: '#60a5fa'  },
    { label: 'Pases %',       value: `${passPct}%`,           accent: '#B8B8B8'  },
    { label: 'xA',            value: stats.xA,                accent: '#E8A838'  },
  ];
  return [
    { label: 'Goles',         value: stats.goals,             accent: '#64ffda'  },
    { label: 'Asistencias',   value: stats.assists,           accent: '#60a5fa'  },
    { label: 'xG / partido',  value: stats.matches > 0 ? (stats.xG / stats.matches).toFixed(2) : '—', accent: '#E8A838' },
    { label: 'Tiros arco %',  value: `${shotsPct}%`,          accent: '#B8B8B8'  },
  ];
}

// ── Donut values ──────────────────────────────────────────────────────────────

export interface DonutDef {
  label: string;
  value: number;
  color: string;
}

export function getDonutValues(
  position: Position | '',
  stats: AggregatedStats,
  raw: PlayerStats[],
): DonutDef[] {
  const totalShots = raw.reduce((s, r) => s + r.total_shots, 0);
  const onTarget   = raw.reduce((s, r) => s + r.shots_on_target, 0);
  const totalPass  = raw.reduce((s, r) => s + r.total_pass, 0);
  const accPass    = raw.reduce((s, r) => s + r.accurate_pass, 0);
  const duelWon    = raw.reduce((s, r) => s + r.duel_won, 0);
  const duelLost   = raw.reduce((s, r) => s + r.duel_lost, 0);
  const aerialWon  = raw.reduce((s, r) => s + r.aerial_won, 0);
  const aerialLost = raw.reduce((s, r) => s + r.aerial_lost, 0);
  const dribbleWon = raw.reduce((s, r) => s + r.won_contest, 0);
  const dribbleTot = raw.reduce((s, r) => s + r.total_contest, 0);

  const ratingPct   = Math.min(100, stats.avgRating * 10);
  const passPct     = totalPass  > 0 ? (accPass    / totalPass)   * 100 : 0;
  const shotsPct    = totalShots > 0 ? (onTarget   / totalShots)  * 100 : 0;
  const convPct     = stats.matches > 0 ? Math.min(100, (stats.goals / stats.matches) * 100 * 4) : 0;
  const dribblePct  = dribbleTot > 0 ? (dribbleWon  / dribbleTot) * 100 : 0;
  const aerialPct   = (aerialWon + aerialLost) > 0 ? (aerialWon / (aerialWon + aerialLost)) * 100 : 0;

  if (position === 'G') return [
    { label: 'Rating',        value: ratingPct,  color: '#60a5fa' },
    { label: 'Pases',         value: passPct,    color: '#64ffda' },
    { label: 'Duelos',        value: duelWon > 0 ? (duelWon / Math.max(1, duelWon + duelLost)) * 100 : 0, color: '#E8A838' },
    { label: 'Arcos en cero', value: Math.min(100, (stats.cleanSheets / Math.max(1, stats.matches)) * 100 * 2), color: '#a78bfa' },
    { label: 'Aéreos',        value: aerialPct,  color: '#64ffda' },
    { label: 'Paradas',       value: stats.saves > 0 ? Math.min(100, stats.saves / Math.max(1, stats.matches) * 10) : 0, color: '#f472b6' },
  ];

  return [
    { label: position === 'D' ? 'Tackles' : 'Rating', value: position === 'D' ? Math.min(100, (stats.tackles / Math.max(1, stats.matches)) * 10) : ratingPct, color: '#60a5fa' },
    { label: 'Pases',         value: passPct,    color: '#64ffda' },
    { label: 'Tiros arco',    value: shotsPct,   color: '#60a5fa' },
    { label: 'Conversión',    value: convPct,    color: '#a78bfa' },
    { label: 'Regates',       value: dribblePct, color: '#E8A838' },
    { label: 'Aéreos',        value: aerialPct,  color: '#64ffda' },
  ];
}

// ── Stats table sections ──────────────────────────────────────────────────────

export interface StatSection {
  title: string;
  accent: string;
  rows: { label: string; value: string | number; max: number }[];
}

export function getStatSections(
  position: Position | '',
  stats: AggregatedStats,
  raw: PlayerStats[],
): StatSection[] {
  const totalShots = raw.reduce((s, r) => s + r.total_shots, 0);
  const onTarget   = raw.reduce((s, r) => s + r.shots_on_target, 0);
  const totalPass  = raw.reduce((s, r) => s + r.total_pass, 0);
  const accPass    = raw.reduce((s, r) => s + r.accurate_pass, 0);
  const duelWon    = raw.reduce((s, r) => s + r.duel_won, 0);
  const duelLost   = raw.reduce((s, r) => s + r.duel_lost, 0);
  const aerialWon  = raw.reduce((s, r) => s + r.aerial_won, 0);
  const aerialLost = raw.reduce((s, r) => s + r.aerial_lost, 0);
  const dribbleWon = raw.reduce((s, r) => s + r.won_contest, 0);
  const dribbleTot = raw.reduce((s, r) => s + r.total_contest, 0);
  const fouls      = raw.reduce((s, r) => s + r.fouls, 0);
  const wasFouled  = raw.reduce((s, r) => s + r.was_fouled, 0);
  const yellowCards = raw.reduce((s, r) => s + r.yellow_card, 0);
  const touches    = raw.reduce((s, r) => s + r.touches, 0);
  const keyPasses  = raw.reduce((s, r) => s + r.key_pass, 0);
  const longBalls  = raw.reduce((s, r) => s + r.total_long_balls, 0);
  const accLongBalls = raw.reduce((s, r) => s + r.accurate_long_balls, 0);
  const crosses    = raw.reduce((s, r) => s + r.total_cross, 0);
  const accCrosses = raw.reduce((s, r) => s + r.accurate_cross, 0);

  const passPct    = totalPass > 0 ? Math.round((accPass / totalPass) * 100) : 0;
  const longBallPct = longBalls > 0 ? Math.round((accLongBalls / longBalls) * 100) : 0;
  const crossPct   = crosses > 0 ? Math.round((accCrosses / crosses) * 100) : 0;
  const shotsPct   = totalShots > 0 ? Math.round((onTarget / totalShots) * 100) : 0;
  const duelPct    = (duelWon + duelLost) > 0 ? Math.round((duelWon / (duelWon + duelLost)) * 100) : 0;
  const aerialPct  = (aerialWon + aerialLost) > 0 ? Math.round((aerialWon / (aerialWon + aerialLost)) * 100) : 0;
  const dribblePct = dribbleTot > 0 ? Math.round((dribbleWon / dribbleTot) * 100) : 0;

  const sections: StatSection[] = [];

  // General
  sections.push({
    title: 'General',
    accent: '#64ffda',
    rows: [
      { label: 'Partidos',        value: stats.matches,   max: 38 },
      { label: 'Minutos totales', value: raw.reduce((s, r) => s + r.minutes_played, 0), max: 3400 },
      { label: 'Rating prom.',    value: stats.avgRating.toFixed(2), max: 10 },
      { label: 'Tarjetas amar.', value: yellowCards,      max: 15 },
      { label: 'Faltas cometidas', value: fouls,          max: 80 },
      { label: 'Faltas recibidas', value: wasFouled,      max: 80 },
    ],
  });

  // Portería only for GK
  if (position === 'G') {
    sections.push({
      title: 'Portería',
      accent: '#60a5fa',
      rows: [
        { label: 'Paradas',        value: stats.saves,          max: 120 },
        { label: 'Arcos en cero',  value: stats.cleanSheets,    max: 20  },
        { label: 'Goles encajados',value: stats.goalsConceded,  max: 60  },
      ],
    });
  }

  // Ataque (non-GK)
  if (position !== 'G') {
    sections.push({
      title: 'Ataque',
      accent: '#64ffda',
      rows: [
        { label: 'Goles',          value: stats.goals,          max: 40  },
        { label: 'Asistencias',    value: stats.assists,        max: 25  },
        { label: 'xG total',       value: stats.xG.toFixed(1),  max: 30  },
        { label: 'xA total',       value: stats.xA.toFixed(1),  max: 20  },
        { label: 'Remates totales',value: totalShots,           max: 150 },
        { label: 'Remates arco',   value: onTarget,             max: 80  },
        { label: 'Precisión tiros',value: `${shotsPct}%`,       max: 100 },
      ],
    });
  }

  // Pases
  sections.push({
    title: 'Pases',
    accent: '#60a5fa',
    rows: [
      { label: 'Toques',           value: touches,              max: 2000 },
      { label: 'Pases totales',    value: totalPass,            max: 1500 },
      { label: 'Pases precisos',   value: accPass,              max: 1200 },
      { label: 'Precisión pases',  value: `${passPct}%`,        max: 100  },
      { label: 'Pases clave',      value: keyPasses,            max: 80   },
      { label: 'Precisión long.',  value: `${longBallPct}%`,    max: 100  },
      { label: 'Centros precisos', value: `${crossPct}%`,       max: 100  },
    ],
  });

  // Defensa
  sections.push({
    title: 'Defensa',
    accent: '#E8A838',
    rows: [
      { label: 'Tackles',          value: stats.tackles,        max: 120 },
      { label: 'Intercepciones',   value: stats.interceptions,  max: 80  },
      { label: 'Despejes',         value: stats.clearances,     max: 150 },
      { label: 'Recuperaciones',   value: raw.reduce((s, r) => s + r.ball_recovery, 0), max: 200 },
    ],
  });

  // Duelos
  sections.push({
    title: 'Duelos',
    accent: '#a78bfa',
    rows: [
      { label: 'Duelos ganados',   value: duelWon,              max: 300 },
      { label: 'Duelos %',         value: `${duelPct}%`,        max: 100 },
      { label: 'Aéreos ganados',   value: aerialWon,            max: 100 },
      { label: 'Aéreos %',         value: `${aerialPct}%`,      max: 100 },
      { label: 'Regates exitosos', value: dribbleWon,           max: 80  },
      { label: 'Regates %',        value: `${dribblePct}%`,     max: 100 },
    ],
  });

  return sections;
}

// ── Radar axes ────────────────────────────────────────────────────────────────

export interface RadarPoint {
  label: string;
  value: number;   // 0-1
}

export function getRadarPoints(
  position: Position | '',
  stats: AggregatedStats,
  raw: PlayerStats[],
): RadarPoint[] {
  const totalShots = raw.reduce((s, r) => s + r.total_shots, 0);
  const onTarget   = raw.reduce((s, r) => s + r.shots_on_target, 0);
  const totalPass  = raw.reduce((s, r) => s + r.total_pass, 0);
  const accPass    = raw.reduce((s, r) => s + r.accurate_pass, 0);
  const duelWon    = raw.reduce((s, r) => s + r.duel_won, 0);
  const duelLost   = raw.reduce((s, r) => s + r.duel_lost, 0);
  const aerialWon  = raw.reduce((s, r) => s + r.aerial_won, 0);
  const aerialLost = raw.reduce((s, r) => s + r.aerial_lost, 0);
  const dribbleWon = raw.reduce((s, r) => s + r.won_contest, 0);
  const dribbleTot = raw.reduce((s, r) => s + r.total_contest, 0);

  const clamp = (v: number) => Math.min(1, Math.max(0, v));

  if (position === 'G') return [
    { label: 'Rating',   value: clamp(stats.avgRating / 10) },
    { label: 'Paradas',  value: clamp(stats.saves / 100) },
    { label: 'Pases',    value: clamp(totalPass > 0 ? accPass / totalPass : 0) },
    { label: 'Arcos 0',  value: clamp(stats.cleanSheets / 15) },
    { label: 'Aéreos',   value: clamp((aerialWon + aerialLost) > 0 ? aerialWon / (aerialWon + aerialLost) : 0) },
    { label: 'Duelos',   value: clamp((duelWon + duelLost) > 0 ? duelWon / (duelWon + duelLost) : 0) },
  ];

  if (position === 'D') return [
    { label: 'Rating',   value: clamp(stats.avgRating / 10) },
    { label: 'Tackles',  value: clamp(stats.tackles / 100) },
    { label: 'Interc.',  value: clamp(stats.interceptions / 80) },
    { label: 'Pases',    value: clamp(totalPass > 0 ? accPass / totalPass : 0) },
    { label: 'Aéreos',   value: clamp((aerialWon + aerialLost) > 0 ? aerialWon / (aerialWon + aerialLost) : 0) },
    { label: 'Duelos',   value: clamp((duelWon + duelLost) > 0 ? duelWon / (duelWon + duelLost) : 0) },
  ];

  if (position === 'M') return [
    { label: 'Rating',   value: clamp(stats.avgRating / 10) },
    { label: 'Asist',    value: clamp(stats.assists / 15) },
    { label: 'Pases',    value: clamp(totalPass > 0 ? accPass / totalPass : 0) },
    { label: 'xG',       value: clamp(stats.xG / 15) },
    { label: 'Tackles',  value: clamp(stats.tackles / 60) },
    { label: 'Regates',  value: clamp(dribbleTot > 0 ? dribbleWon / dribbleTot : 0) },
  ];

  // F
  return [
    { label: 'Rating',   value: clamp(stats.avgRating / 10) },
    { label: 'Goles',    value: clamp(stats.goals / 30) },
    { label: 'Asist',    value: clamp(stats.assists / 15) },
    { label: 'xG',       value: clamp(stats.xG / 25) },
    { label: 'Tiros',    value: clamp(totalShots > 0 ? onTarget / totalShots : 0) },
    { label: 'Regates',  value: clamp(dribbleTot > 0 ? dribbleWon / dribbleTot : 0) },
  ];
}

// ── Rating evolution per match ────────────────────────────────────────────────

export interface RatingPoint {
  index: number;
  rating: number;
}

export function getRatingEvolution(raw: PlayerStats[]): RatingPoint[] {
  return raw
    .filter((r) => r.rating != null && r.rating > 0)
    .slice(-20)
    .map((r, i) => ({ index: i, rating: r.rating! }));
}

// ── Localization helpers ──────────────────────────────────────────────────────

const FOOT_MAP: Record<string, string> = {
  R: 'Derecha',
  L: 'Izquierda',
  right: 'Derecha',
  left: 'Izquierda',
  Right: 'Derecha',
  Left: 'Izquierda',
  Both: 'Ambos',
  both: 'Ambos',
};

export function formatFoot(foot: string | null | undefined): string {
  if (!foot) return 'N/D';
  return FOOT_MAP[foot] ?? foot;
}

const AVAILABILITY_MAP: Record<string, string> = {
  available: 'Disponible',
  injured: 'Lesionado',
  suspended: 'Suspendido',
  uncertain: 'Dudoso',
  unavailable: 'No disponible',
};

export function formatAvailability(av: string | null | undefined): string {
  if (!av) return 'N/D';
  return AVAILABILITY_MAP[av.toLowerCase()] ?? av;
}

// ── Bio rows ─────────────────────────────────────────────────────────────────

export interface BioRow {
  label: string;
  value: string;
  accent?: boolean;
}

export function getBioRows(player: Player): BioRow[] {
  return [
    { label: 'Edad',            value: getAge(player.date_of_birth) != null ? `${getAge(player.date_of_birth)} años` : 'N/D' },
    { label: 'Altura',          value: player.height_cm ? `${player.height_cm} cm` : 'N/D' },
    { label: 'Peso',            value: player.weight_kg ? `${player.weight_kg} kg` : 'N/D' },
    { label: 'Pie preferido',   value: formatFoot(player.preferred_foot) },
    { label: 'Valor mercado',   value: formatMarketValue(player.market_value_eur), accent: true },
    { label: 'Contrato hasta',  value: player.contract_until ? new Date(player.contract_until).getFullYear().toString() : 'N/D' },
    { label: 'Disponibilidad',  value: formatAvailability(player.availability) },
  ];
}
