import { View, Text, Pressable, FlatList, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import type { EnrichedPlayer } from '@/hooks/queries/use-league';
import type { AggregatedStats } from '@/lib/bzzoiro/types';
import { PositionBadge } from './position-badge';
import { ratingColor } from '@/lib/player-utils';
import type { SortKey, SortDir } from './player-filters';

interface Column {
  key: SortKey | 'player' | 'pos' | 'age' | 'club';
  label: string;
  flex: number;
  minWidth: number;
  sortable: boolean;
  align?: 'left' | 'right' | 'center';
}

const COLUMNS: Column[] = [
  { key: 'player',  label: 'Jugador', flex: 3,   minWidth: 220, sortable: false, align: 'left' },
  { key: 'pos',     label: 'Pos',     flex: 0,   minWidth: 64,  sortable: false, align: 'center' },
  { key: 'age',     label: 'Edad',    flex: 0,   minWidth: 64,  sortable: false, align: 'center' },
  { key: 'club',    label: 'Club',    flex: 2.5, minWidth: 160, sortable: false, align: 'left' },
  { key: 'goals',   label: 'Goles',   flex: 1,   minWidth: 80,  sortable: true,  align: 'right' },
  { key: 'assists', label: 'Asist',   flex: 1,   minWidth: 80,  sortable: true,  align: 'right' },
  { key: 'xG',      label: 'xG',      flex: 1,   minWidth: 80,  sortable: true,  align: 'right' },
  { key: 'rating',  label: 'Rating',  flex: 1,   minWidth: 90,  sortable: true,  align: 'right' },
];

const TOTAL_MIN_WIDTH = COLUMNS.reduce((s, c) => s + c.minWidth, 0);

function cellStyle(col: Column) {
  return col.flex === 0
    ? { width: col.minWidth }
    : { flex: col.flex, minWidth: col.minWidth };
}

function calcAge(dob: string | null): string {
  if (!dob) return '—';
  return `${Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25))}`;
}

interface HeaderCellProps {
  col: Column;
  sortBy: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function HeaderCell({ col, sortBy, sortDir, onSort }: HeaderCellProps) {
  const active = col.sortable && (col.key as SortKey) === sortBy;
  const arrow = active ? (sortDir === 'desc' ? ' ↓' : ' ↑') : '';
  const justifyContent =
    col.align === 'right' ? 'flex-end' : col.align === 'center' ? 'center' : 'flex-start';

  return (
    <Pressable
      style={[cellStyle(col), { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, justifyContent }]}
      onPress={col.sortable ? () => onSort(col.key as SortKey) : undefined}
      disabled={!col.sortable}
    >
      <Text style={{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, color: active ? '#64ffda' : '#717171' }}>
        {col.label}{arrow}
      </Text>
    </Pressable>
  );
}

interface RowProps {
  player: EnrichedPlayer;
  index: number;
  stats?: AggregatedStats;
}

function TableRow({ player, index, stats }: RowProps) {
  const router = useRouter();
  const even = index % 2 === 0;
  const rating = stats?.avgRating;
  const color = rating ? ratingColor(rating) : undefined;

  return (
    <Pressable
      onPress={() => router.push(`/player/${player.id}`)}
      style={{
        flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#2C2C2C',
        backgroundColor: even ? '#161616' : '#1C1C1C',
      }}
    >
      {/* Jugador */}
      <View style={[cellStyle(COLUMNS[0]), { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12, paddingVertical: 8 }]}>
        <Image
          source={{ uri: `https://sports.bzzoiro.com/img/player/${player.id}/` }}
          style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#222' }}
          contentFit="cover"
        />
        <Text style={{ color: '#F2F2F2', fontSize: 12, fontWeight: '600', flex: 1 }} numberOfLines={1}>
          {player.name}
        </Text>
      </View>

      {/* Posicion */}
      <View style={[cellStyle(COLUMNS[1]), { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }]}>
        <PositionBadge position={player.position} size="sm" />
      </View>

      {/* Edad */}
      <View style={[cellStyle(COLUMNS[2]), { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 }]}>
        <Text style={{ color: '#B8B8B8', fontSize: 12 }}>{calcAge(player.date_of_birth)}</Text>
      </View>

      {/* Club */}
      <View style={[cellStyle(COLUMNS[3]), { justifyContent: 'center', paddingHorizontal: 12 }]}>
        <Text style={{ color: '#B8B8B8', fontSize: 12 }} numberOfLines={1}>{player.team_name}</Text>
      </View>

      {/* Goles */}
      <View style={[cellStyle(COLUMNS[4]), { alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 12 }]}>
        <Text style={{ color: '#F2F2F2', fontSize: 12, fontWeight: '600' }}>{stats?.goals ?? '—'}</Text>
      </View>

      {/* Asist */}
      <View style={[cellStyle(COLUMNS[5]), { alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 12 }]}>
        <Text style={{ color: '#F2F2F2', fontSize: 12, fontWeight: '600' }}>{stats?.assists ?? '—'}</Text>
      </View>

      {/* xG */}
      <View style={[cellStyle(COLUMNS[6]), { alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 12 }]}>
        <Text style={{ color: '#F2F2F2', fontSize: 12, fontWeight: '600' }}>{stats?.xG ?? '—'}</Text>
      </View>

      {/* Rating */}
      <View style={[cellStyle(COLUMNS[7]), { alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 16 }]}>
        <Text style={{ fontSize: 12, fontWeight: '800', color: color ?? '#717171' }}>
          {rating ? rating.toFixed(1) : '—'}
        </Text>
      </View>
    </Pressable>
  );
}

interface PlayerTableProps {
  players: EnrichedPlayer[];
  sortBy: SortKey;
  sortDir: SortDir;
  onSortChange: (key: SortKey) => void;
  onEndReached?: () => void;
  hasMore?: boolean;
}

export function PlayerTable({ players, sortBy, sortDir, onSortChange, onEndReached, hasMore }: PlayerTableProps) {
  const queryClient = useQueryClient();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1, minWidth: TOTAL_MIN_WIDTH, width: '100%' }}>
        {/* Sticky header */}
        <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#3C3C3C', backgroundColor: '#131313' }}>
          {COLUMNS.map((col) => (
            <HeaderCell key={col.key} col={col} sortBy={sortBy} sortDir={sortDir} onSort={onSortChange} />
          ))}
        </View>

        {/* Rows */}
        <FlatList
          data={players}
          keyExtractor={(item) => String(item.id)}
          style={{ flex: 1 }}
          renderItem={({ item, index }) => {
            const statsData = queryClient.getQueryData<{ aggregated: AggregatedStats }>(['player-stats', item.id]);
            return <TableRow player={item} index={index} stats={statsData?.aggregated} />;
          }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator
          contentContainerStyle={{ paddingBottom: 80 }}
          ListFooterComponent={
            hasMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Text style={{ color: '#717171', fontSize: 12 }}>Cargando más...</Text>
              </View>
            ) : null
          }
        />
      </View>
    </ScrollView>
  );
}
