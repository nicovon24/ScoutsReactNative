import { View, Text, TextInput, Pressable, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
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

  const teamSelect = teams.length > 0 ? (
    <Select options={teamOptions} value={selectedTeam} onChange={onTeamChange} placeholder="Todos los equipos" />
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

  const searchInput = (width?: number) => (
    <View style={{ gap: 8, width }}>
      <Text style={{ color: '#F2F2F2', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 }}>
        BUSCAR JUGADORES
      </Text>
      <View
        style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#1C1C1C',
          borderRadius: 999,
          paddingHorizontal: 18, paddingVertical: 12,
          gap: 12,
          borderWidth: 1, borderColor: '#3C3C3C',
        }}
      >
        <Text style={{ fontSize: 16, color: '#717171' }}>&#128269;</Text>
        <TextInput
          value={search}
          onChangeText={onSearchChange}
          placeholder="Nombre, club..."
          placeholderTextColor="#888"
          style={[
            { flex: 1, color: '#F2F2F2', fontSize: 14, fontWeight: '500' },
            Platform.OS === 'web' ? ({ outlineStyle: 'none', boxShadow: 'none' } as object) : undefined,
          ]}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <Pressable onPress={() => onSearchChange('')}>
            <Text style={{ color: '#888', fontSize: 14 }}>✕</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ gap: 14, paddingHorizontal: 16, paddingBottom: 12, zIndex: 50 }}>

      {/* ── Row 1: leagues + team ── */}
      {isWide ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, zIndex: 50 }}>
          {leagueRow}
          {teams.length > 0 && <View style={{ width: 1, height: 28, backgroundColor: '#2C2C2C' }} />}
          <View style={{ width: 240 }}>{teamSelect}</View>
        </View>
      ) : (
        <View style={{ zIndex: 50, gap: 8 }}>
          {leagueRow}
          {teamSelect}
        </View>
      )}

      {/* ── Row 2: search (left) + position + sort (right) ── */}
      {isWide ? (
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
      ) : (
        <>
          {searchInput()}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
        </>
      )}
    </View>
  );
}
