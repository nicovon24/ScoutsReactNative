import { useMemo, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Users } from 'lucide-react-native';
import { useQueries, useQuery } from '@tanstack/react-query';
import { useLeagueStandings } from '@/hooks/queries/use-league';
import { PREMIER_LEAGUE_ID, getPlayerDetail, getStandings, getTeamSquad } from '@/lib/bzzoiro/endpoints';
import type { Player, SquadPlayer } from '@/lib/bzzoiro/types';
import { NationalityFlag } from '@/components/scout/nationality-flag';
import { PositionBadge } from '@/components/scout/position-badge';

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  const standings = await getStandings();
  return standings.standings.map((t) => ({ id: String(t.team_id) }));
}

// ── Types & constants ───────────────────────────────────────────────────────

const POSITION_LABELS: Record<string, string> = {
  G: 'Porteros',
  D: 'Defensores',
  M: 'Mediocampistas',
  F: 'Delanteros',
  '': 'Sin posición',
};

const POSITION_ORDER: Array<SquadPlayer['position']> = ['G', 'D', 'M', 'F', ''];

type SortKey = 'name' | 'age' | 'height' | 'value' | 'contract' | null;
type SortDir = 'asc' | 'desc';

interface Row {
  squad: SquadPlayer;
  detail: Player | undefined;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function calcAge(dob: string | null): number | null {
  if (!dob) return null;
  return Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
}

function formatMarketValue(value: number | null | undefined): string | null {
  if (value == null || value <= 0) return null;
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `€${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) return `€${Math.round(value / 1_000)}K`;
  return `€${value}`;
}

function formatContractYear(contract: string | null | undefined): string | null {
  if (!contract) return null;
  const d = new Date(contract);
  if (Number.isNaN(d.getTime())) return null;
  return `hasta ${d.getFullYear()}`;
}

function formatHeight(cm: number | null | undefined): string | null {
  if (!cm || cm <= 0) return null;
  return `${(cm / 100).toFixed(2)}m`;
}

function formatFoot(foot: string | undefined): string | null {
  if (!foot) return null;
  const f = foot.toLowerCase();
  if (f.startsWith('left') || f.startsWith('izq')) return 'Izq';
  if (f.startsWith('right') || f.startsWith('der')) return 'Der';
  if (f.startsWith('both') || f.startsWith('ambi')) return 'Ambi';
  return foot;
}

function compareNullable<T>(a: T | null | undefined, b: T | null | undefined, dir: SortDir): number {
  const aNull = a == null;
  const bNull = b == null;
  if (aNull && bNull) return 0;
  if (aNull) return 1;
  if (bNull) return -1;
  const cmp = a! < b! ? -1 : a! > b! ? 1 : 0;
  return dir === 'asc' ? cmp : -cmp;
}

function sortRows(rows: Row[], key: SortKey, dir: SortDir): Row[] {
  if (!key) return rows;
  const copy = [...rows];
  copy.sort((ra, rb) => {
    switch (key) {
      case 'name':
        return compareNullable(ra.squad.name.toLowerCase(), rb.squad.name.toLowerCase(), dir);
      case 'age':
        return compareNullable(calcAge(ra.squad.date_of_birth), calcAge(rb.squad.date_of_birth), dir);
      case 'height':
        return compareNullable(ra.detail?.height_cm, rb.detail?.height_cm, dir);
      case 'value':
        return compareNullable(ra.detail?.market_value_eur, rb.detail?.market_value_eur, dir);
      case 'contract':
        return compareNullable(ra.detail?.contract_until, rb.detail?.contract_until, dir);
    }
  });
  return copy;
}

function groupRowsByPosition(rows: Row[]): Array<{ pos: SquadPlayer['position']; items: Row[] }> {
  const map: Partial<Record<SquadPlayer['position'], Row[]>> = {};
  for (const r of rows) {
    if (!map[r.squad.position]) map[r.squad.position] = [];
    map[r.squad.position]!.push(r);
  }
  return POSITION_ORDER
    .filter((pos) => map[pos] && map[pos]!.length > 0)
    .map((pos) => ({ pos, items: map[pos]! }));
}

// ── Column layout ───────────────────────────────────────────────────────────

const COL = {
  player:    { flex: 3,   minWidth: 220 },
  position:  { flex: 0,   width: 64,  label: 'Pos',      sortable: false },
  specPos:   { flex: 0,   width: 80,  label: 'Pos esp.', sortable: false },
  age:       { flex: 1,   minWidth: 70, label: 'Edad',     sortable: true,  key: 'age' as const },
  height:    { flex: 1,   minWidth: 80, label: 'Altura',   sortable: true,  key: 'height' as const },
  foot:      { flex: 0,   width: 64,  label: 'Pie',      sortable: false },
  value:     { flex: 1.2, minWidth: 90, label: 'Valor',    sortable: true,  key: 'value' as const },
  contract:  { flex: 1.4, minWidth: 110, label: 'Contrato', sortable: true,  key: 'contract' as const },
};

// ── Screen ──────────────────────────────────────────────────────────────────

export default function ClubDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);

  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const { data: standingsData } = useLeagueStandings(PREMIER_LEAGUE_ID);

  // Key propia para no colisionar con useLeaguePlayers (cachea EnrichedPlayer[], no SquadResponse)
  const { data: squadData, isPending: squadLoading } = useQuery({
    queryKey: ['club-detail-squad', teamId],
    queryFn: () => getTeamSquad(teamId),
    staleTime: 1000 * 60 * 60 * 24,
    enabled: teamId > 0,
  });

  const teamEntry = standingsData?.standings.find((t) => t.team_id === teamId);
  const players = squadData?.players ?? [];
  const totalPlayers = squadData?.count ?? 0;

  const detailQueries = useQueries({
    queries: players.map((p) => ({
      queryKey: ['player-detail', p.id] as const,
      queryFn: () => getPlayerDetail(p.id),
      staleTime: 1000 * 60 * 60 * 24,
      enabled: p.id > 0,
    })),
  });

  const detailsLoaded = detailQueries.filter((q) => q.data).length;

  const rows: Row[] = useMemo(
    () => players.map((p, idx) => ({ squad: p, detail: detailQueries[idx]?.data })),
    [players, detailQueries],
  );

  const sortedRows = useMemo(() => sortRows(rows, sortKey, sortDir), [rows, sortKey, sortDir]);
  const groups = useMemo(() => groupRowsByPosition(sortedRows), [sortedRows]);

  function toggleSort(key: NonNullable<SortKey>) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
      {/* Back */}
      <View style={{ paddingTop: Platform.OS === 'web' ? 16 : 48, paddingHorizontal: 16, paddingBottom: 8 }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/clubs'))}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 4,
            alignSelf: 'flex-start', paddingVertical: 6, paddingHorizontal: 4,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <ChevronLeft size={18} color="#717171" />
          <Text style={{ color: '#717171', fontSize: 13, fontWeight: '600' }}>Clubes</Text>
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <View style={{
            backgroundColor: '#111', borderRadius: 20, borderWidth: 1, borderColor: '#222',
            padding: 24, flexDirection: 'row', alignItems: 'center', gap: 20,
          }}>
            <Image
              source={{ uri: `https://sports.bzzoiro.com/img/team/${teamId}/` }}
              style={{ width: 80, height: 80 }}
              contentFit="contain"
            />
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={{ color: '#F2F2F2', fontSize: 22, fontWeight: '900', letterSpacing: -0.3 }}>
                {teamEntry?.team_name ?? '—'}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <NationalityFlag nationality="England" width={18} radius={3} />
                <Text style={{ color: '#717171', fontSize: 12, fontWeight: '500' }}>Inglaterra</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <Users size={12} color="#717171" />
                <Text style={{ color: '#717171', fontSize: 12, fontWeight: '500' }}>
                  {totalPlayers} jugadores
                </Text>
                {totalPlayers > 0 && detailsLoaded < totalPlayers && (
                  <Text style={{ color: '#3C3C3C', fontSize: 11, fontWeight: '500', marginLeft: 6 }}>
                    · cargando datos {detailsLoaded}/{totalPlayers}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Plantilla */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40, gap: 24 }}>
          {squadLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator color="#64ffda" />
            </View>
          ) : (
            groups.map(({ pos, items }) => (
              <View key={pos}>
                {/* Section label */}
                <View style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#1E1E1E',
                }}>
                  <Text style={{ color: '#64ffda', fontSize: 11, fontWeight: '800', letterSpacing: 1.8, textTransform: 'uppercase' }}>
                    {POSITION_LABELS[pos]}
                  </Text>
                  <Text style={{ color: '#3C3C3C', fontSize: 11, fontWeight: '700' }}>{items.length}</Text>
                </View>

                {/* Headers */}
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1A1A1A' }}>
                  <SortableHeader
                    label="Jugador"
                    sortKey="name"
                    activeKey={sortKey}
                    dir={sortDir}
                    onPress={() => toggleSort('name')}
                    style={{ flex: COL.player.flex, minWidth: COL.player.minWidth, paddingHorizontal: 4 }}
                    align="left"
                  />
                  <ColHeader label="Pos"      style={{ width: COL.position.width }} align="center" />
                  <ColHeader label="Pos esp." style={{ width: COL.specPos.width }}  align="center" />
                  <SortableHeader
                    label="Edad" sortKey="age" activeKey={sortKey} dir={sortDir}
                    onPress={() => toggleSort('age')}
                    style={{ flex: COL.age.flex, minWidth: COL.age.minWidth }}
                    align="center"
                  />
                  <SortableHeader
                    label="Altura" sortKey="height" activeKey={sortKey} dir={sortDir}
                    onPress={() => toggleSort('height')}
                    style={{ flex: COL.height.flex, minWidth: COL.height.minWidth }}
                    align="center"
                  />
                  <ColHeader label="Pie" style={{ width: COL.foot.width }} align="center" />
                  <SortableHeader
                    label="Valor" sortKey="value" activeKey={sortKey} dir={sortDir}
                    onPress={() => toggleSort('value')}
                    style={{ flex: COL.value.flex, minWidth: COL.value.minWidth }}
                    align="right"
                  />
                  <SortableHeader
                    label="Contrato" sortKey="contract" activeKey={sortKey} dir={sortDir}
                    onPress={() => toggleSort('contract')}
                    style={{ flex: COL.contract.flex, minWidth: COL.contract.minWidth }}
                    align="right"
                  />
                </View>

                {/* Rows */}
                {items.map((row, i) => (
                  <PlayerRow
                    key={row.squad.id}
                    row={row}
                    striped={i % 2 === 1}
                    onPress={() => router.push(`/player/${row.squad.id}` as never)}
                  />
                ))}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Row ─────────────────────────────────────────────────────────────────────

function PlayerRow({ row, striped, onPress }: { row: Row; striped: boolean; onPress: () => void }) {
  const { squad: p, detail } = row;
  const age = calcAge(p.date_of_birth);
  const heightLabel = formatHeight(detail?.height_cm);
  const footLabel = formatFoot(detail?.preferred_foot);
  const valueLabel = formatMarketValue(detail?.market_value_eur);
  const contractLabel = formatContractYear(detail?.contract_until);
  const specPos = detail?.specific_position?.trim();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1, borderBottomColor: '#141414',
        backgroundColor: pressed ? '#161616' : striped ? '#0D0D0D' : 'transparent',
      })}
    >
      {/* Jugador */}
      <View style={{ flex: COL.player.flex, minWidth: COL.player.minWidth, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 4 }}>
        <Image
          source={{ uri: `https://sports.bzzoiro.com/img/player/${p.id}/` }}
          style={{ width: 34, height: 34, borderRadius: 8, backgroundColor: '#1C1C1C' }}
          contentFit="cover"
        />
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {p.jersey_number != null && (
              <Text style={{ color: '#3C3C3C', fontSize: 11, fontWeight: '700' }}>
                #{p.jersey_number}
              </Text>
            )}
            <Text style={{ color: '#F2F2F2', fontSize: 13, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>
              {p.name}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <NationalityFlag nationality={p.nationality} width={14} radius={2} />
            <Text style={{ color: '#717171', fontSize: 10, fontWeight: '500' }} numberOfLines={1}>
              {p.nationality}
            </Text>
          </View>
        </View>
      </View>

      {/* Pos generica */}
      <View style={{ width: COL.position.width, alignItems: 'center' }}>
        <PositionBadge position={p.position} size="sm" />
      </View>

      {/* Pos especifica */}
      <View style={{ width: COL.specPos.width, alignItems: 'center' }}>
        <Text style={{ color: specPos ? '#B8B8B8' : '#3C3C3C', fontSize: 12, fontWeight: '700' }}>
          {specPos || '—'}
        </Text>
      </View>

      {/* Edad */}
      <View style={{ flex: COL.age.flex, minWidth: COL.age.minWidth, alignItems: 'center' }}>
        <Text style={{ color: age != null ? '#B8B8B8' : '#3C3C3C', fontSize: 12, fontWeight: '500' }}>
          {age != null ? `${age} años` : '—'}
        </Text>
      </View>

      {/* Altura */}
      <View style={{ flex: COL.height.flex, minWidth: COL.height.minWidth, alignItems: 'center' }}>
        <Text style={{ color: heightLabel ? '#B8B8B8' : '#3C3C3C', fontSize: 12, fontWeight: '500' }}>
          {heightLabel ?? '—'}
        </Text>
      </View>

      {/* Pie */}
      <View style={{ width: COL.foot.width, alignItems: 'center' }}>
        <Text style={{ color: footLabel ? '#B8B8B8' : '#3C3C3C', fontSize: 12, fontWeight: '600' }}>
          {footLabel ?? '—'}
        </Text>
      </View>

      {/* Valor */}
      <View style={{ flex: COL.value.flex, minWidth: COL.value.minWidth, alignItems: 'flex-end', paddingRight: 8 }}>
        {valueLabel ? (
          <Text style={{ color: '#64ffda', fontSize: 13, fontWeight: '800' }}>{valueLabel}</Text>
        ) : (
          <Text style={{ color: '#3C3C3C', fontSize: 12 }}>—</Text>
        )}
      </View>

      {/* Contrato */}
      <View style={{ flex: COL.contract.flex, minWidth: COL.contract.minWidth, alignItems: 'flex-end', paddingRight: 4 }}>
        {contractLabel ? (
          <Text style={{ color: '#B8B8B8', fontSize: 12, fontWeight: '600' }}>{contractLabel}</Text>
        ) : (
          <Text style={{ color: '#3C3C3C', fontSize: 12 }}>—</Text>
        )}
      </View>
    </Pressable>
  );
}

// ── Header cells ────────────────────────────────────────────────────────────

const HEADER_TEXT = {
  fontSize: 10,
  fontWeight: '700' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: 0.8,
};

interface ColHeaderProps {
  label: string;
  style: object;
  align: 'left' | 'center' | 'right';
}

function ColHeader({ label, style, align }: ColHeaderProps) {
  return (
    <View style={[{ alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center' }, style]}>
      <Text style={[HEADER_TEXT, { color: '#3C3C3C' }]}>{label}</Text>
    </View>
  );
}

interface SortableHeaderProps {
  label: string;
  sortKey: NonNullable<SortKey>;
  activeKey: SortKey;
  dir: SortDir;
  onPress: () => void;
  style: object;
  align: 'left' | 'center' | 'right';
}

function SortableHeader({ label, sortKey, activeKey, dir, onPress, style, align }: SortableHeaderProps) {
  const active = activeKey === sortKey;
  const arrow = active ? (dir === 'desc' ? ' ↓' : ' ↑') : '';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          alignItems: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          flexDirection: 'row',
          justifyContent: align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center',
          opacity: pressed ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text style={[HEADER_TEXT, { color: active ? '#64ffda' : '#3C3C3C' }]}>
        {label}{arrow}
      </Text>
    </Pressable>
  );
}
