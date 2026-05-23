import { View, Text, TextInput, Pressable, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import type { Position } from '@/lib/bzzoiro/types';
import { LEAGUES } from '@/lib/bzzoiro/endpoints';
import { Select, type SelectOption } from '@/components/ui/select';

const POSITIONS: Array<{ key: Position | 'ALL'; label: string }> = [
  { key: 'ALL', label: 'Todos' },
  { key: 'G', label: 'POR' },
  { key: 'D', label: 'DEF' },
  { key: 'M', label: 'MED' },
  { key: 'F', label: 'DEL' },
];

export const SORT_OPTIONS = [
  { key: 'rating',  label: 'Rating' },
  { key: 'goals',   label: 'Goles' },
  { key: 'assists', label: 'Asist' },
  { key: 'xG',      label: 'xG' },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]['key'];
export type SortDir = 'asc' | 'desc';

export interface TeamOption {
  id: number;
  name: string;
}

interface PlayerFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  position: Position | 'ALL';
  onPositionChange: (v: Position | 'ALL') => void;
  sortBy: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey) => void;
  teams?: TeamOption[];
  selectedTeam: number | null;
  onTeamChange: (id: number | null) => void;
  selectedLeague: number;
  onLeagueChange: (id: number) => void;
}

export function PlayerFilters({
  search, onSearchChange,
  position, onPositionChange,
  sortBy, sortDir, onSortChange,
  teams = [], selectedTeam, onTeamChange,
  selectedLeague, onLeagueChange,
}: PlayerFiltersProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // ── League pills ─────────────────────────────────────────────────────────
  const leagueRow = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 2, alignItems: 'center' }}>
      {LEAGUES.map((league) => {
        const active = selectedLeague === league.id;
        // Bundesliga (id 5) needs a red background for its white logo to show
        const bg = league.id === 5 ? '#d20015' : '#FFFFFF';
        const size = active ? 40 : 30;
        return (
          <Pressable
            key={league.id}
            onPress={() => onLeagueChange(league.id)}
            style={{
              width: size, height: size,
              borderRadius: 8,
              backgroundColor: bg,
              overflow: 'hidden',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: active ? 1 : 0.65,
              transitionDuration: '180ms',
              ...(active
                ? { shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } }
                : {}),
            } as object}
          >
            <Image
              source={{ uri: `https://sports.bzzoiro.com/img/league/${league.id}/` }}
              style={{ width: size - 4, height: size - 4 }}
              contentFit="contain"
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );

  // ── Team select ───────────────────────────────────────────────────────────
  const teamOptions: SelectOption<number>[] = teams.map((t) => ({
    value: t.id,
    label: t.name,
    iconUrl: `https://sports.bzzoiro.com/img/team/${t.id}/`,
  }));

  const teamSelectDesktop = teams.length > 0 ? (
    <Select options={teamOptions} value={selectedTeam} onChange={onTeamChange} placeholder="Todos los equipos" />
  ) : null;

  const teamSelectMobile = teams.length > 0 ? (
    <Select options={teamOptions} value={selectedTeam} onChange={onTeamChange} placeholder="Todos los equipos" triggerHeight={34} />
  ) : null;

  // ── Chip helpers ─────────────────────────────────────────────────────────
  function PosPill({ p }: { p: typeof POSITIONS[number] }) {
    const active = position === p.key;
    return (
      <Pressable
        onPress={() => onPositionChange(p.key)}
        style={{
          paddingHorizontal: isWide ? 10 : 12,
          paddingVertical: isWide ? 6 : 6,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: active ? '#64ffda' : '#2C2C2C',
          backgroundColor: active ? '#64ffda' : '#161616',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '700', color: active ? '#000' : '#B8B8B8' }}>
          {p.label}
        </Text>
      </Pressable>
    );
  }

  function SortPill({ s }: { s: typeof SORT_OPTIONS[number] }) {
    const active = sortBy === s.key;
    const arrow = active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';
    return (
      <Pressable
        onPress={() => onSortChange(s.key)}
        style={{
          paddingHorizontal: 10, paddingVertical: 5,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: active ? '#64ffda' : '#2C2C2C',
          backgroundColor: active ? 'rgba(100,255,218,0.10)' : 'transparent',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: active ? '700' : '400', color: active ? '#64ffda' : '#717171' }}>
          {s.label}{arrow}
        </Text>
      </Pressable>
    );
  }

  // Shared input row used by both compact (mobile) and full (desktop) versions
  const inputRow = (compact?: boolean) => (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: '#1C1C1C',
        borderRadius: compact ? 8 : 999,
        paddingHorizontal: compact ? 10 : 14,
        paddingVertical: compact ? 6 : 9,
        gap: 8,
        borderWidth: 1, borderColor: '#3C3C3C',
        height: compact ? 34 : undefined,
      }}
    >
      <Feather name="search" size={13} color="#888" />
      <TextInput
        value={search}
        onChangeText={onSearchChange}
        placeholder="Nombre, club..."
        placeholderTextColor="#888"
        style={[
          { flex: 1, color: '#F2F2F2', fontSize: compact ? 11 : 12, fontWeight: '500' },
          Platform.OS === 'web' ? ({ outlineStyle: 'none', boxShadow: 'none' } as object) : undefined,
        ]}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {search.length > 0 && (
        <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
          <Feather name="x" size={13} color="#888" />
        </Pressable>
      )}
    </View>
  );

  const searchInput = (width?: number) => (
    <View style={{ gap: 6, width }}>
      <Text style={{ color: '#F2F2F2', fontSize: 10, fontWeight: '800', letterSpacing: 1.5 }}>
        BUSCAR JUGADORES
      </Text>
      {inputRow()}
    </View>
  );

  return (
    <View style={{ gap: isWide ? 14 : 18, paddingHorizontal: 16, paddingBottom: 12, zIndex: 50 }}>

      {isWide ? (
        // ───────── Desktop / wide ─────────────────────────────────────────────
        <>
          {/* Row 1: leagues + team select side-by-side */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              rowGap: 8,
              columnGap: 12,
              zIndex: 50,
            }}
          >
            <View style={{ flexShrink: 1 }}>{leagueRow}</View>
            {teams.length > 0 && (
              <>
                <View style={{ width: 1, height: 28, backgroundColor: '#2C2C2C' }} />
                <View style={{ width: 180, flexShrink: 1, minWidth: 150, maxWidth: 200 }}>
                  {teamSelectDesktop}
                </View>
              </>
            )}
          </View>

          {/* Row 2: search + position + sort */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            {searchInput(280)}
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap', flex: 1, paddingBottom: 4 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {POSITIONS.map((p) => <PosPill key={p.key} p={p} />)}
              </View>
              <View style={{ width: 1, height: 16, backgroundColor: '#2C2C2C', marginHorizontal: 4 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                  <Text style={{ color: '#717171', fontSize: 12 }}>↕</Text>
                  {SORT_OPTIONS.map((s) => <SortPill key={s.key} s={s} />)}
                </View>
              </ScrollView>
            </View>
          </View>
        </>
      ) : (
        // ───────── Mobile ─────────────────────────────────────────────────────
        <>
          {/* Leagues alone */}
          <View style={{ zIndex: 1 }}>{leagueRow}</View>

          {/* 2-col grid: searchbar (left) | team select (right) — same height */}
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', zIndex: 50 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              {inputRow(true)}
            </View>
            {teams.length > 0 && (
              <View style={{ width: 140, flexShrink: 0 }}>
                {teamSelectMobile}
              </View>
            )}
          </View>

          {/* Position pills */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {POSITIONS.map((p) => <PosPill key={p.key} p={p} />)}
          </View>

          {/* Sort row — separated with its own label */}
          <View style={{ gap: 6, marginTop: 2 }}>
            <Text style={{ color: '#717171', fontSize: 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}>
              Ordenar por
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                {SORT_OPTIONS.map((s) => <SortPill key={s.key} s={s} />)}
              </View>
            </ScrollView>
          </View>
        </>
      )}
    </View>
  );
}
