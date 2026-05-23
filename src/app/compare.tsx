import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart2, ChevronLeft, RotateCcw, Search, X } from 'lucide-react-native';
import { useState } from 'react';

import { usePlayerDetail, usePlayerStats } from '@/hooks/queries/use-player-detail';
import { useLeaguePlayers } from '@/hooks/queries/use-league';
import { PREMIER_LEAGUE_ID } from '@/lib/bzzoiro/endpoints';
import { useCompareStore } from '@/store/compare-store';
import { PositionBadge } from '@/components/scout/position-badge';
import { NationalityFlag } from '@/components/scout/nationality-flag';
import { CompareRadar, COMPARE_COLORS } from '@/components/scout/compare-radar';
import { CompareStatRow, CompareSectionTitle } from '@/components/scout/compare-stat-row';
import {
  getAge,
  ratingColor,
  getRadarPoints,
  getStatSections,
  formatMarketValue,
} from '@/lib/player-detail';

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:       '#0F0F0F',
  surface:  '#161616',
  card:     '#1C1C1C',
  border:   '#2C2C2C',
  primary:  '#F2F2F2',
  secondary:'#B8B8B8',
  muted:    '#717171',
  green:    '#64ffda',
};

// ── Slot header card ──────────────────────────────────────────────────────────

function SlotCard({
  playerId,
  color,
  onRemove,
}: {
  playerId: number;
  color: string;
  onRemove: () => void;
}) {
  const { data: player, isLoading } = usePlayerDetail(playerId);
  const { data: statsData } = usePlayerStats(playerId);
  const rating = statsData?.aggregated.avgRating ?? 0;
  const photoUrl = `https://sports.bzzoiro.com/img/player/${playerId}/`;
  const teamLogoUrl = player?.current_team_id
    ? `https://sports.bzzoiro.com/img/team/${player.current_team_id}/`
    : null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 160, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border }}>
        <ActivityIndicator size="small" color={color} />
      </View>
    );
  }

  if (!player) return null;

  return (
    <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
      {/* Color accent bar */}
      <View style={{ height: 3, backgroundColor: color, opacity: 0.7 }} />

      <View style={{ padding: 14, alignItems: 'center', gap: 10 }}>
        {/* Remove button */}
        <Pressable
          onPress={onRemove}
          style={({ pressed }) => ({
            position: 'absolute', top: 10, right: 10, zIndex: 10,
            width: 26, height: 26, borderRadius: 99,
            backgroundColor: pressed ? 'rgba(240,68,68,0.15)' : 'rgba(255,255,255,0.05)',
            alignItems: 'center', justifyContent: 'center',
          })}
        >
          <X size={12} color={C.muted} />
        </Pressable>

        {/* Avatar */}
        <View style={{ width: 72, height: 72, borderRadius: 99, borderWidth: 2.5, borderColor: color, overflow: 'hidden', backgroundColor: C.card }}>
          <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </View>

        {/* Info */}
        <View style={{ alignItems: 'center', gap: 4 }}>
          <Text style={{ color: C.primary, fontSize: 15, fontWeight: '900', textAlign: 'center' }} numberOfLines={1}>
            {player.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
            <PositionBadge position={player.position} size="sm" />
            {teamLogoUrl && player.team_name && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Image source={{ uri: teamLogoUrl }} style={{ width: 14, height: 14 }} contentFit="contain" />
                <Text style={{ color: C.muted, fontSize: 11 }} numberOfLines={1}>{player.team_name}</Text>
              </View>
            )}
            <NationalityFlag nationality={player.nationality} width={18} radius={3} />
          </View>
        </View>

        {/* Rating badge */}
        {rating > 0 && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ color: ratingColor(rating), fontSize: 16, fontWeight: '900' }}>{rating.toFixed(1)}</Text>
            <Text style={{ color: C.muted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>Rating</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Searchable empty slot ─────────────────────────────────────────────────────

function SearchSlot({
  label,
  color,
  excludeIds,
  onSelect,
}: {
  label: string;
  color: string;
  excludeIds: number[];
  onSelect: (id: number, name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { players } = useLeaguePlayers(PREMIER_LEAGUE_ID);

  const filtered = query.length >= 1
    ? players.filter(
        (p) =>
          !excludeIds.includes(p.id) &&
          p.name.toLowerCase().includes(query.toLowerCase()),
      ).slice(0, 8)
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed', padding: 14, gap: 12, minHeight: 160 }}>
      {/* Icon + label */}
      <View style={{ alignItems: 'center', gap: 6 }}>
        <View style={{ width: 36, height: 36, borderRadius: 99, borderWidth: 1.5, borderColor: color, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }}>
          <Search size={16} color={color} />
        </View>
        <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</Text>
      </View>

      {/* Search input */}
      <View
        style={{
          flexDirection: 'row', alignItems: 'center', gap: 8,
          backgroundColor: C.card,
          borderRadius: 10, borderWidth: 1,
          borderColor: focused ? color : C.border,
          paddingHorizontal: 10, paddingVertical: 8,
        }}
      >
        <Search size={12} color={C.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Buscar jugador…"
          placeholderTextColor={C.muted}
          style={{ flex: 1, color: C.primary, fontSize: 12, fontWeight: '600', outline: 'none' } as object}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')}>
            <X size={12} color={C.muted} />
          </Pressable>
        )}
      </View>

      {/* Results dropdown */}
      {filtered.length > 0 && (
        <View style={{ borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' }}>
          {filtered.map((p, i) => {
            const photoUrl = `https://sports.bzzoiro.com/img/player/${p.id}/`;
            return (
              <Pressable
                key={p.id}
                onPress={() => { onSelect(p.id, p.name); setQuery(''); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 8,
                  padding: 8,
                  backgroundColor: pressed ? '#222' : C.card,
                  borderTopWidth: i > 0 ? 1 : 0,
                  borderTopColor: C.border,
                })}
              >
                <View style={{ width: 28, height: 28, borderRadius: 99, overflow: 'hidden', backgroundColor: '#2C2C2C' }}>
                  <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700' }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ color: C.muted, fontSize: 10 }}>{p.position} · {p.team_name}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {query.length >= 1 && filtered.length === 0 && (
        <Text style={{ color: C.muted, fontSize: 11, textAlign: 'center' }}>Sin resultados</Text>
      )}
    </View>
  );
}

// ── Compare content (stats + radar) ──────────────────────────────────────────

function CompareContent({ idA, idB }: { idA: number; idB: number }) {
  const { data: playerA } = usePlayerDetail(idA);
  const { data: playerB } = usePlayerDetail(idB);
  const { data: statsA } = usePlayerStats(idA);
  const { data: statsB } = usePlayerStats(idB);

  const aggA = statsA?.aggregated;
  const aggB = statsB?.aggregated;
  const rawA = statsA?.raw ?? [];
  const rawB = statsB?.raw ?? [];

  if (!aggA || !aggB || !playerA || !playerB) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  const radarA = getRadarPoints(playerA.position, aggA, rawA);
  const radarB = getRadarPoints(playerB.position, aggB, rawB);
  const sectionsA = getStatSections(playerA.position, aggA, rawA);

  // Flat stat rows for comparison
  const allRows: { label: string; valA: string | number; valB: string | number; max: number; lower?: boolean }[] = [];
  for (const section of sectionsA) {
    allRows.push({ label: `— ${section.title} —`, valA: '', valB: '', max: 0 });
    for (const row of section.rows) {
      const sectB = getStatSections(playerB.position, aggB, rawB).find((s) => s.title === section.title);
      const rowB = sectB?.rows.find((r) => r.label === row.label);
      const lowerLabels = ['Tarjetas amar.', 'Faltas cometidas'];
      allRows.push({
        label: row.label,
        valA: row.value,
        valB: rowB?.value ?? '—',
        max: row.max,
        lower: lowerLabels.includes(row.label),
      });
    }
  }

  // Bio rows for side-by-side
  const bioRows = [
    { label: 'Edad', valA: getAge(playerA.date_of_birth) != null ? `${getAge(playerA.date_of_birth)} años` : 'N/D', valB: getAge(playerB.date_of_birth) != null ? `${getAge(playerB.date_of_birth)} años` : 'N/D', max: 0 },
    { label: 'Altura', valA: playerA.height_cm ? `${playerA.height_cm} cm` : 'N/D', valB: playerB.height_cm ? `${playerB.height_cm} cm` : 'N/D', max: 0 },
    { label: 'Valor', valA: formatMarketValue(playerA.market_value_eur), valB: formatMarketValue(playerB.market_value_eur), max: 0 },
    { label: 'Rating', valA: aggA.avgRating.toFixed(1), valB: aggB.avgRating.toFixed(1), max: 10 },
    { label: 'Partidos', valA: aggA.matches, valB: aggB.matches, max: 60 },
    { label: 'Goles', valA: aggA.goals, valB: aggB.goals, max: 40 },
    { label: 'Asistencias', valA: aggA.assists, valB: aggB.assists, max: 25 },
    { label: 'xG', valA: aggA.xG, valB: aggB.xG, max: 25 },
    { label: 'xA', valA: aggA.xA, valB: aggB.xA, max: 20 },
    { label: 'Tackles', valA: aggA.tackles, valB: aggB.tackles, max: 120 },
    { label: 'Intercepciones', valA: aggA.interceptions, valB: aggB.interceptions, max: 80 },
    { label: 'Pases clave', valA: aggA.keyPasses, valB: aggB.keyPasses, max: 80 },
  ];

  return (
    <View style={{ gap: 16 }}>
      {/* Bio comparison */}
      <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ color: C.green, fontSize: 9, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Comparativa</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {/* VS header */}
        <View style={{ flexDirection: 'row', marginBottom: 12 }}>
          <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: COMPARE_COLORS[0] }} />
          </View>
          <View style={{ width: 110, alignItems: 'center' }}>
            <Text style={{ color: C.muted, fontSize: 11, fontWeight: '900', letterSpacing: 2 }}>VS</Text>
          </View>
          <View style={{ flex: 1, paddingLeft: 8 }}>
            <View style={{ width: 8, height: 8, borderRadius: 99, backgroundColor: COMPARE_COLORS[1] }} />
          </View>
        </View>

        {bioRows.map((row, i) => (
          <CompareStatRow
            key={i}
            label={row.label}
            valueA={row.valA}
            valueB={row.valB}
            maxValue={row.max}
          />
        ))}
      </View>

      {/* Radar */}
      {radarA.length > 0 && radarB.length > 0 && (
        <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, alignSelf: 'stretch' }}>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
            <Text style={{ color: C.green, fontSize: 9, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Radar</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          </View>
          <CompareRadar
            pointsA={radarA}
            pointsB={radarB}
            nameA={playerA.name}
            nameB={playerB.name}
            size={240}
          />
        </View>
      )}

      {/* Full stats */}
      <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, alignSelf: 'stretch' }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
          <Text style={{ color: C.green, fontSize: 9, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Stats completos</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
        </View>

        {allRows.map((row, i) => {
          if (row.max === 0 && row.valA === '') {
            return <CompareSectionTitle key={i} title={row.label.replace(/— /g, '').replace(/ —/g, '')} accent={C.green} />;
          }
          return (
            <CompareStatRow
              key={i}
              label={row.label}
              valueA={row.valA}
              valueB={row.valB}
              maxValue={row.max}
              lowerIsBetter={row.lower}
            />
          );
        })}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CompareScreen() {
  const { ids } = useLocalSearchParams<{ ids: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { slots, removeFromCompare, clearCompare, addToCompare } = useCompareStore();

  // Parse IDs from query params; merge with local search-selected IDs
  const paramIds = ids ? ids.split(',').map(Number).filter(Boolean) : [];
  const storeIds = slots.map((p) => p.id);
  const baseIds = paramIds.length >= 2 ? paramIds : storeIds;

  // Local overrides for search-slot selections
  const [localA, setLocalA] = useState<number | null>(null);
  const [localB, setLocalB] = useState<number | null>(null);

  const idA = localA ?? baseIds[0] ?? null;
  const idB = localB ?? baseIds[1] ?? null;
  const bothReady = Boolean(idA && idB);
  const maxW = Math.min(width - 32, 900);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ maxWidth: maxW, alignSelf: 'center', width: '100%', gap: 16 }}>

        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: pressed ? C.card : C.surface,
              borderWidth: 1, borderColor: C.border,
              borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
            })}
          >
            <ChevronLeft size={14} color={C.green} />
            <Text style={{ color: C.secondary, fontSize: 13, fontWeight: '600' }}>Jugadores</Text>
          </Pressable>

          {bothReady && (
            <Pressable
              onPress={() => { clearCompare(); router.replace('/'); }}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center', gap: 6,
                backgroundColor: pressed ? 'rgba(240,68,68,0.12)' : 'transparent',
                borderWidth: 1, borderColor: 'rgba(240,68,68,0.25)',
                borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8,
              })}
            >
              <RotateCcw size={12} color="#F04444" />
              <Text style={{ color: '#F04444', fontSize: 12, fontWeight: '800' }}>Limpiar</Text>
            </Pressable>
          )}
        </View>

        {/* Title */}
        <View>
          <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>
            Comparación de jugadores
          </Text>
          <Text style={{ color: C.primary, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 }}>
            {bothReady ? 'Análisis comparativo' : 'Seleccioná jugadores'}
          </Text>
        </View>

        {/* Slot cards */}
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
          {idA
            ? <SlotCard playerId={idA} color={COMPARE_COLORS[0]} onRemove={() => { removeFromCompare(idA); setLocalA(null); }} />
            : <SearchSlot
                label="Primer jugador"
                color={COMPARE_COLORS[0]}
                excludeIds={[idB ?? -1].filter((x) => x > 0)}
                onSelect={(id, name) => {
                  setLocalA(id);
                  addToCompare({ id, name } as never);
                }}
              />
          }

          {/* VS divider */}
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <Text style={{ color: C.muted, fontSize: 13, fontWeight: '900', letterSpacing: 2 }}>VS</Text>
          </View>

          {idB
            ? <SlotCard playerId={idB} color={COMPARE_COLORS[1]} onRemove={() => { removeFromCompare(idB); setLocalB(null); }} />
            : <SearchSlot
                label="Segundo jugador"
                color={COMPARE_COLORS[1]}
                excludeIds={[idA ?? -1].filter((x) => x > 0)}
                onSelect={(id, name) => {
                  setLocalB(id);
                  addToCompare({ id, name } as never);
                }}
              />
          }
        </View>

        {/* Empty state */}
        {!bothReady && (
          <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 32, alignItems: 'center', gap: 10 }}>
            <BarChart2 size={32} color={C.muted} />
            <Text style={{ color: C.primary, fontSize: 16, fontWeight: '900' }}>Seleccioná al menos 2 jugadores</Text>
            <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
              Presioná el botón + en las tarjetas de la lista para agregarlos a la comparación.
            </Text>
          </View>
        )}

        {/* Compare content */}
        {bothReady && <CompareContent idA={idA} idB={idB} />}

      </View>
    </ScrollView>
  );
}
