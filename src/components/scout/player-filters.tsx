import { Select, type SelectOption } from '@/components/ui/select';
import { LEAGUES } from '@/lib/bzzoiro/endpoints';
import type { Position } from '@/lib/bzzoiro/types';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { SlidersHorizontal } from 'lucide-react-native';
import { Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';

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
  onAdvancedFiltersPress: () => void;
  activeAdvancedCount: number;
}

export function PlayerFilters({
  search, onSearchChange,
  position, onPositionChange,
  sortBy, sortDir, onSortChange,
  teams = [], selectedTeam, onTeamChange,
  selectedLeague, onLeagueChange,
  onAdvancedFiltersPress, activeAdvancedCount,
}: PlayerFiltersProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  // ── League pills ─────────────────────────────────────────────────────────
  const leagueRow = (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: isWide ? 6 : 10, paddingVertical: 2, alignItems: 'center' }}>
      {LEAGUES.map((league) => {
        const active = selectedLeague === league.id;
        // Bundesliga (id 5) needs a red background for its white logo to show
        const bg = league.id === 5 ? '#d20015' : '#FFFFFF';
        const size = isWide ? (active ? 28 : 22) : (active ? 40 : 30);
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

  // ── Chip helpers ─────────────────────────────────────────────────────────
  function PosPill({ p }: { p: typeof POSITIONS[number] }) {
    const active = position === p.key;
    return (
      <Pressable
        onPress={() => onPositionChange(p.key)}
        style={{
          paddingHorizontal: isWide ? 8 : 12,
          paddingVertical: isWide ? 4 : 6,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: active ? '#64ffda' : '#2C2C2C',
          backgroundColor: active ? '#64ffda' : '#161616',
        }}
      >
        <Text style={{ fontSize: isWide ? 11 : 12, fontWeight: '700', color: active ? '#000' : '#B8B8B8' }}>
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
          paddingHorizontal: isWide ? 8 : 10,
          paddingVertical: isWide ? 3 : 5,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: active ? '#64ffda' : '#2C2C2C',
          backgroundColor: active ? 'rgba(100,255,218,0.10)' : 'transparent',
        }}
      >
        <Text style={{ fontSize: isWide ? 11 : 12, fontWeight: active ? '700' : '400', color: active ? '#64ffda' : '#717171' }}>
          {s.label}{arrow}
        </Text>
      </Pressable>
    );
  }

  // ── Advanced filters button ──────────────────────────────────────────────
  function AdvancedButton({ count, onPress, compact: isCompact }: { count: number; onPress: () => void; compact: boolean }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: isCompact ? 12 : 14,
          paddingVertical: isCompact ? 7 : 8,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: count > 0 ? '#64ffda' : '#2C2C2C',
          backgroundColor: count > 0 ? 'rgba(100,255,218,0.08)' : pressed ? '#1C1C1C' : 'transparent',
          height: isCompact ? 34 : undefined,
        })}
      >
        <SlidersHorizontal size={14} color={count > 0 ? '#64ffda' : '#B8B8B8'} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: count > 0 ? '#64ffda' : '#B8B8B8' }}>
          Filtros
        </Text>
        {count > 0 && (
          <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: '#64ffda', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 9, fontWeight: '900', color: '#000' }}>{count}</Text>
          </View>
        )}
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
        paddingHorizontal: compact ? 10 : isWide ? 10 : 14,
        paddingVertical: compact ? 6 : isWide ? 5 : 9,
        gap: 6,
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
    <View style={{ gap: 4, width }}>
      <Text style={{ color: '#717171', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        Buscar
      </Text>
      {inputRow()}
    </View>
  );

  return (
    <View style={{ gap: isWide ? 8 : 18, paddingHorizontal: 16, paddingBottom: isWide ? 8 : 12, zIndex: 50 }}>

      {isWide ? (
        // ───────── Desktop / wide ─────────────────────────────────────────────
        <>
          {/* Row 1: leagues + team select side-by-side */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              flexWrap: 'wrap',
              rowGap: 6,
              columnGap: 10,
              zIndex: 50,
            }}
          >
            <View style={{ flexShrink: 1 }}>{leagueRow}</View>
            {teams.length > 0 && (
              <>
                <View style={{ width: 1, height: 20, backgroundColor: '#2C2C2C' }} />
                <View style={{ width: 160, flexShrink: 1, minWidth: 130, maxWidth: 180 }}>
                  {teamSelectDesktop}
                </View>
              </>
            )}
          </View>

          {/* Row 2: search + position + advanced filters */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {searchInput(220)}
            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
              {POSITIONS.map((p) => <PosPill key={p.key} p={p} />)}
            </View>
            <AdvancedButton count={activeAdvancedCount} onPress={onAdvancedFiltersPress} compact={false} />
          </View>
        </>
      ) : (
        // ───────── Mobile ─────────────────────────────────────────────────────
        <>
          {/* Leagues alone */}
          <View style={{ zIndex: 1 }}>{leagueRow}</View>

          {/* searchbar + advanced filters button */}
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', zIndex: 50 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              {inputRow(true)}
            </View>
            <AdvancedButton count={activeAdvancedCount} onPress={onAdvancedFiltersPress} compact />
          </View>

          {/* Position pills */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {POSITIONS.map((p) => <PosPill key={p.key} p={p} />)}
          </View>

          {/* Sort row */}
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
