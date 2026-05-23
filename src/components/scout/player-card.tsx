import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import type { EnrichedPlayer } from '@/hooks/queries/use-league';
import { usePlayerStats, usePlayerDetail } from '@/hooks/queries/use-player-detail';
import { getAge, formatValue, ratingColor } from '@/lib/player-utils';
import { PositionBadge } from './position-badge';
import { NationalityFlag } from './nationality-flag';
import { StatsByPosition } from './stats-by-position';
import { RatingBar } from './rating-bar';

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ─── compact card (multi-column grid) ────────────────────────────────────────

function CompactCard({ player, hovered }: { player: EnrichedPlayer; hovered: boolean }) {
  const { data: statsData } = usePlayerStats(player.id);
  const { data: detail } = usePlayerDetail(player.id);
  const stats = statsData?.aggregated;
  const rating = stats?.avgRating ?? 0;
  const color = rating > 0 ? ratingColor(rating) : '#3f3f46';
  const photoUrl = `https://sports.bzzoiro.com/img/player/${player.id}/`;
  const teamBadgeUrl = `https://sports.bzzoiro.com/img/team/${player.team_id}/`;

  // First 2 position stats for compact view
  const posStats = stats
    ? (() => {
        const s = stats;
        const d = (v: number | undefined): string | number => (v ?? 0);
        if (player.position === 'G') return [{ label: 'Ataj.', value: d(s.saves) }, { label: '% Atj.', value: s.saves + s.goalsConceded > 0 ? ((s.saves / (s.saves + s.goalsConceded)) * 100).toFixed(0) + '%' : '—' }];
        if (player.position === 'D') return [{ label: 'Tackles', value: d(s.tackles) }, { label: 'Intercep', value: d(s.interceptions) }];
        return [{ label: 'Goles', value: d(s.goals) }, { label: 'Asist', value: d(s.assists) }];
      })()
    : [{ label: 'Goles', value: '—' }, { label: 'Asist', value: '—' }];

  return (
    <View
      style={{
        backgroundColor: '#1C1C1C',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: hovered ? '#64ffda' : '#2C2C2C',
        transform: [{ translateY: hovered ? -4 : 0 }],
        transitionDuration: '200ms',
        flex: 1,
      } as object}
    >
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-2.5 pt-2.5">
        <View className="flex-row items-center gap-1.5">
          <PositionBadge position={player.position} size="sm" />
          <NationalityFlag nationality={player.nationality} width={18} />
        </View>
        <View className="items-end">
          <Text className="text-muted text-2xs uppercase tracking-widest">Valor</Text>
          <Text className="text-gold font-black text-xs leading-tight">{formatValue(detail?.market_value_eur)}</Text>
        </View>
      </View>

      {/* Photo + name */}
      <View className="items-center px-2 pt-2 pb-2 gap-1.5">
        <View className="rounded-xl overflow-hidden border border-border" style={{ width: 56, height: 56 }}>
          <Image
            source={{ uri: photoUrl }}
            style={{ width: 56, height: 56 }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: BLURHASH }}
          />
        </View>
        <Text className="text-primary text-xs font-black text-center leading-tight tracking-tight" numberOfLines={1}>
          {player.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Image source={{ uri: teamBadgeUrl }} style={{ width: 12, height: 12 }} contentFit="contain" />
          <Text className="text-secondary text-2xs font-medium" numberOfLines={1}>{player.team_name}</Text>
        </View>
        <Text className="text-muted text-2xs" numberOfLines={1}>{getAge(player.date_of_birth)}</Text>
      </View>

      {/* 2-stat row */}
      <View className="flex-row border-t border-border px-2.5 py-2 gap-1">
        {posStats.map((s, i) => (
          <View key={s.label} className="flex-1 items-center">
            {i > 0 && <View className="absolute left-0 top-0 bottom-0 w-px bg-border" />}
            <Text className="text-primary text-sm font-bold leading-none">{s.value}</Text>
            <Text className="text-muted text-2xs uppercase tracking-wider mt-0.5" numberOfLines={1}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Rating bar */}
      <View className="flex-row items-center border-t border-border px-2.5 py-2 gap-2">
        <View className="flex-1 h-1.5 bg-card-2 rounded-full overflow-hidden">
          {rating > 0 && (
            <View style={{ height: '100%', width: `${(rating / 10) * 100}%`, backgroundColor: color, borderRadius: 99 }} />
          )}
        </View>
        <View style={{ backgroundColor: rating > 0 ? color : '#2C2C2C', borderRadius: 14, paddingHorizontal: 6, paddingVertical: 2, minWidth: 32, alignItems: 'center' }}>
          <Text style={{ color: rating > 0 ? '#000' : '#717171', fontSize: 11, fontWeight: '800' }}>
            {rating > 0 ? rating.toFixed(1) : '—'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── full card ────────────────────────────────────────────────────────────────

function FullCard({ player, hovered }: { player: EnrichedPlayer; hovered: boolean }) {
  const { data: statsData } = usePlayerStats(player.id);
  const { data: detail } = usePlayerDetail(player.id);
  const stats = statsData?.aggregated;
  const rating = stats?.avgRating ?? 0;
  const color = rating > 0 ? ratingColor(rating) : '#3f3f46';
  const photoUrl = `https://sports.bzzoiro.com/img/player/${player.id}/`;
  const teamBadgeUrl = `https://sports.bzzoiro.com/img/team/${player.team_id}/`;

  return (
    <View
      style={{
        backgroundColor: '#1C1C1C',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: hovered ? '#64ffda' : '#2C2C2C',
        transform: [{ translateY: hovered ? -6 : 0 }],
        transitionDuration: '200ms',
        ...(hovered ? { shadowColor: '#64ffda', shadowOpacity: 0.25, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } } : {}),
      } as object}
    >
      {/* Ambient glow */}
      {hovered && (
        <View
          style={{
            position: 'absolute', top: -60, right: -60,
            width: 120, height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(100,255,218,0.08)',
          }}
          pointerEvents="none"
        />
      )}

      {/* ── Top bar: position · flag | valor ── */}
      <View className="flex-row items-start justify-between px-5 pt-5 pb-3">
        <View className="flex-row items-center gap-2.5">
          <PositionBadge position={player.position} />
          <NationalityFlag nationality={player.nationality} width={30} radius={5} />
        </View>
        <View className="items-end">
          <Text className="text-muted text-2xs uppercase tracking-widest font-bold">Valor</Text>
          <Text className="text-primary font-black text-base leading-tight mt-0.5">
            {formatValue(detail?.market_value_eur)}
          </Text>
        </View>
      </View>

      {/* ── Player row: photo (zoomed) + info ── */}
      <View className="flex-row items-center px-5 pb-5 gap-4">
        {/* Photo with zoom */}
        <View
          style={{
            width: 84, height: 84,
            borderRadius: 18,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: hovered ? '#3C3C3C' : '#2C2C2C',
            backgroundColor: '#222222',
          }}
        >
          <Image
            source={{ uri: photoUrl }}
            style={{
              width: 84,
              height: 84,
              transform: [{ scale: 1.28 }, { translateY: 4 }],
            }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: BLURHASH }}
          />
        </View>

        {/* Name + meta */}
        <View className="flex-1 gap-2">
          <Text className="text-primary font-black text-xl leading-[22px] tracking-tight" numberOfLines={1}>
            {player.name}
          </Text>
          <View className="flex-row items-center gap-2 flex-wrap">
            <Text className="text-secondary text-sm font-medium">
              {getAge(player.date_of_birth)}
            </Text>
            <View className="w-1 h-1 rounded-full bg-border-h" />
            <View className="flex-row items-center gap-1.5">
              <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#2C2C2C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image source={{ uri: teamBadgeUrl }} style={{ width: 16, height: 16 }} contentFit="contain" />
              </View>
              <Text className="text-secondary text-sm font-medium" numberOfLines={1}>{player.team_name}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Stats by position ── */}
      <View className="px-5 pb-4">
        <StatsByPosition position={player.position} stats={stats} />
      </View>

      {/* ── Rating section ── */}
      <View className="px-5 pb-5 border-t border-border pt-4">
        {/* Label + badge row */}
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-muted text-2xs uppercase font-bold tracking-widest">Desempeño</Text>
          <View
            style={{
              backgroundColor: rating > 0 ? color : '#2C2C2C',
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 4,
              minWidth: 44,
              alignItems: 'center',
              ...(rating > 0
                ? { shadowColor: color, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
                : {}),
            }}
          >
            <Text style={{ color: rating > 0 ? '#000' : '#717171', fontSize: 16, fontWeight: '900' }}>
              {rating > 0 ? rating.toFixed(1) : '—'}
            </Text>
          </View>
        </View>
        {/* Full-width bar */}
        <View className="h-2.5 bg-card-2 rounded-full overflow-hidden">
          {rating > 0 && (
            <View
              style={{
                height: '100%',
                width: `${(rating / 10) * 100}%`,
                backgroundColor: color,
                borderRadius: 99,
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
}

// ─── exported component ───────────────────────────────────────────────────────

export function PlayerCard({ player, compact = false }: { player: EnrichedPlayer; compact?: boolean }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  return (
    <Pressable
      onPress={() => router.push(`/player/${player.id}`)}
      className={compact ? 'flex-1 m-1' : 'mx-3 mb-3'}
      // @ts-expect-error web-only hover events
      onMouseEnter={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onMouseLeave={Platform.OS === 'web' ? () => setHovered(false) : undefined}
    >
      {compact
        ? <CompactCard player={player} hovered={hovered} />
        : <FullCard player={player} hovered={hovered} />
      }
    </Pressable>
  );
}
