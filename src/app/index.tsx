import { useState, useMemo, useCallback } from 'react';
import { View, FlatList, ActivityIndicator, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import {
  useLeaguePlayers,
  useLeagueStandings,
  type EnrichedPlayer,
} from '@/hooks/queries/use-league';
import { PREMIER_LEAGUE_ID } from '@/lib/bzzoiro/endpoints';
import { ScoutHeader, type ViewMode } from '@/components/scout/scout-header';
import { PlayerCard } from '@/components/scout/player-card';
import { PlayerFilters, type SortKey, type SortDir, type TeamOption } from '@/components/scout/player-filters';
import { PlayerTable } from '@/components/scout/player-table';
import { useNumColumns } from '@/hooks/use-num-columns';
import { SkeletonGrid } from '@/components/scout/skeleton-card';
import { AnimatedCard } from '@/components/scout/animated-card';
import type { AggregatedStats, Player, Position } from '@/lib/bzzoiro/types';

const PAGE_SIZE = 20;
const SKELETON_COUNT = 12;

function ErrorState({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3 py-16">
      <Text className="text-white text-lg font-bold text-center">Error al cargar</Text>
      <Text className="text-zinc-400 text-sm text-center">{message}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View className="items-center justify-center py-16">
      <Text className="text-zinc-400 text-sm">No se encontraron jugadores</Text>
    </View>
  );
}

/** Thin progress pill shown while squads are still loading */
function SquadProgress({ loaded, total }: { loaded: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((loaded / total) * 100);
  return (
    <View className="px-4 pb-1 gap-1">
      <View className="flex-row justify-between">
        <Text className="text-zinc-600 text-[10px]">Cargando equipos…</Text>
        <Text className="text-green text-[10px] font-semibold">{loaded}/{total}</Text>
      </View>
      <View className="h-0.5 bg-zinc-800 rounded-full overflow-hidden">
        <View style={{ height: '100%', width: `${pct}%`, backgroundColor: '#64ffda', borderRadius: 99 }} />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState<Position | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<number>(PREMIER_LEAGUE_ID);

  const queryClient = useQueryClient();
  const numColumns = useNumColumns();
  const compact = numColumns > 1;

  // Progressive: players stream in as each team squad resolves
  const { players: allPlayers, isLoading: squadsLoading, teamsTotal, teamsLoaded, error } =
    useLeaguePlayers(selectedLeague);
  const { data: standings } = useLeagueStandings(selectedLeague);

  // Show full skeleton only while standings haven't arrived yet (nothing to show)
  const showFullSkeleton = squadsLoading && allPlayers.length === 0;
  const showProgressBar = squadsLoading && allPlayers.length > 0;

  const getStats = useCallback(
    (id: number): AggregatedStats | undefined =>
      queryClient.getQueryData<{ aggregated: AggregatedStats }>(['player-stats', id])?.aggregated,
    [queryClient],
  );

  const getMarketValue = useCallback(
    (id: number): number =>
      queryClient.getQueryData<Player>(['player-detail', id])?.market_value_eur ?? 0,
    [queryClient],
  );

  function handleLeagueChange(id: number) {
    setSelectedLeague(id);
    setSelectedTeam(null);
    setSearch('');
    setPage(1);
  }

  function handleSortChange(key: SortKey) {
    if (key === sortBy) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortBy(key);
      setSortDir('desc');
    }
    setPage(1);
  }

  function handleSearchChange(v: string) {
    setSearch(v);
    setPage(1);
  }

  function handlePositionChange(v: Position | 'ALL') {
    setPosition(v);
    setPage(1);
  }

  function handleTeamChange(id: number | null) {
    setSelectedTeam(id);
    setPage(1);
  }

  const teams = useMemo<TeamOption[]>(() => {
    const map = new Map<number, string>();
    for (const p of allPlayers) {
      if (!map.has(p.team_id)) map.set(p.team_id, p.team_name);
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allPlayers]);

  const filteredAndSorted = useMemo(() => {
    if (allPlayers.length === 0) return [];

    let result = allPlayers;

    if (selectedTeam !== null) result = result.filter((p) => p.team_id === selectedTeam);
    if (position !== 'ALL') result = result.filter((p) => p.position === position);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.team_name.toLowerCase().includes(q) ||
          (p.nationality?.toLowerCase().includes(q) ?? false),
      );
    }

    const dir = sortDir === 'desc' ? -1 : 1;

    result = [...result].sort((a, b) => {
      if (sortBy === 'name') return dir * a.name.localeCompare(b.name);

      const sa = getStats(a.id);
      const sb = getStats(b.id);

      // Players whose stats haven't loaded yet go to the end
      const aHas = sa !== undefined && sa.matches > 0;
      const bHas = sb !== undefined && sb.matches > 0;
      if (aHas !== bHas) return aHas ? -1 : 1;
      if (!aHas && !bHas) return getMarketValue(b.id) - getMarketValue(a.id);

      let cmp = 0;
      if (sortBy === 'rating')       cmp = dir * ((sa?.avgRating ?? 0) - (sb?.avgRating ?? 0));
      else if (sortBy === 'goals')   cmp = dir * ((sa?.goals ?? 0) - (sb?.goals ?? 0));
      else if (sortBy === 'assists') cmp = dir * ((sa?.assists ?? 0) - (sb?.assists ?? 0));
      else if (sortBy === 'xG')      cmp = dir * ((sa?.xG ?? 0) - (sb?.xG ?? 0));

      return cmp !== 0 ? cmp : getMarketValue(b.id) - getMarketValue(a.id);
    });

    return result;
  }, [allPlayers, selectedTeam, position, search, sortBy, sortDir, getStats, getMarketValue]);

  const visiblePlayers = useMemo(
    () => filteredAndSorted.slice(0, page * PAGE_SIZE),
    [filteredAndSorted, page],
  );

  const hasMore = visiblePlayers.length < filteredAndSorted.length;
  const seasonName = standings?.season?.name;

  const header = (
    <>
      <ScoutHeader
        playerCount={filteredAndSorted.length}
        seasonName={seasonName}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <PlayerFilters
        search={search}
        onSearchChange={handleSearchChange}
        position={position}
        onPositionChange={handlePositionChange}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        teams={teams}
        selectedTeam={selectedTeam}
        onTeamChange={handleTeamChange}
        selectedLeague={selectedLeague}
        onLeagueChange={handleLeagueChange}
      />
      {showProgressBar && <SquadProgress loaded={teamsLoaded} total={teamsTotal} />}
    </>
  );

  // Only show full skeleton while standings haven't arrived (no players yet)
  if (showFullSkeleton) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {header}
          <SkeletonGrid count={SKELETON_COUNT} numColumns={numColumns} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (error && allPlayers.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
        {header}
        <ErrorState message={String(error)} />
      </SafeAreaView>
    );
  }

  if (viewMode === 'table') {
    return (
      <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
        {header}
        {filteredAndSorted.length === 0 ? (
          <EmptyState />
        ) : (
          <PlayerTable
            players={visiblePlayers}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            onEndReached={() => hasMore && setPage((p) => p + 1)}
            hasMore={hasMore}
          />
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      <FlatList<EnrichedPlayer>
        key={`${selectedLeague}-${numColumns}`}
        data={visiblePlayers}
        keyExtractor={(item) => String(item.id)}
        numColumns={numColumns}
        renderItem={({ item, index }) => (
          <AnimatedCard index={index}>
            <PlayerCard player={item} compact={compact} />
          </AnimatedCard>
        )}
        columnWrapperStyle={compact ? { paddingHorizontal: 10 } : undefined}
        ListHeaderComponent={header}
        ListEmptyComponent={squadsLoading ? null : <EmptyState />}
        ListFooterComponent={
          hasMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#64ffda" />
              <Text className="text-zinc-500 text-xs mt-1">Cargando más…</Text>
            </View>
          ) : null
        }
        onEndReached={() => hasMore && setPage((p) => p + 1)}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        initialNumToRender={PAGE_SIZE}
        maxToRenderPerBatch={20}
        windowSize={7}
        removeClippedSubviews
      />
    </SafeAreaView>
  );
}
