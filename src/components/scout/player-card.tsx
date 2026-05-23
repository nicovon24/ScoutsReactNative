import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ArrowLeftRight, CheckCircle } from 'lucide-react-native';
import type { EnrichedPlayer } from '@/hooks/queries/use-league';
import { usePlayerStats, usePlayerDetail } from '@/hooks/queries/use-player-detail';
import { getAge, formatValue, ratingColor } from '@/lib/player-utils';
import { useCompareStore } from '@/store/compare-store';
import { PositionBadge } from './position-badge';
import { NationalityFlag } from './nationality-flag';
import { StatsByPosition } from './stats-by-position';

const BLURHASH = 'L6PZfSi_.AyE_3t7t7R**0o#DgR4';

// ─── full card (unique style for all viewports) ─────────────────────────────

function FullCard({ player, hovered, compact }: { player: EnrichedPlayer; hovered: boolean; compact: boolean }) {
  const { data: statsData } = usePlayerStats(player.id);
  const { data: detail } = usePlayerDetail(player.id);
  const stats = statsData?.aggregated;
  const rating = stats?.avgRating ?? 0;
  const color = rating > 0 ? ratingColor(rating) : '#3f3f46';
  const photoUrl = `https://sports.bzzoiro.com/img/player/${player.id}/`;
  const teamBadgeUrl = `https://sports.bzzoiro.com/img/team/${player.team_id}/`;

  const { addToCompare, removeFromCompare, isInCompare, slots } = useCompareStore();
  const inCompare = isInCompare(player.id);
  const compareFull = slots.length >= 2 && !inCompare;

  // Size tokens — slightly smaller in compact (multi-column desktop grid)
  const t = compact
    ? {
        radius: 18,
        pad: 14,
        padTop: 14,
        photo: 60,
        photoRadius: 12,
        nameSize: 15,
        nameLeading: 17,
        metaSize: 11,
        flagW: 22,
        valueSize: 13,
        valueLabel: 9,
        badgeSize: 13,
        ratingBadgePad: 10,
        gapPhotoInfo: 12,
      }
    : {
        radius: 20,
        pad: 16,
        padTop: 16,
        photo: 68,
        photoRadius: 14,
        nameSize: 16,
        nameLeading: 18,
        metaSize: 12,
        flagW: 24,
        valueSize: 14,
        valueLabel: 9,
        badgeSize: 14,
        ratingBadgePad: 10,
        gapPhotoInfo: 12,
      };

  // Fixed height so every card in the grid lines up perfectly
  const cardHeight = compact ? 280 : 300;

  return (
    <View
      style={{
        width: compact ? '100%' : undefined,
        backgroundColor: '#1C1C1C',
        borderRadius: t.radius,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: hovered ? '#64ffda' : '#2C2C2C',
        height: cardHeight,
        justifyContent: 'space-between',
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

      {/* ── Top bar: position · flag | compare + valor ── */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: t.pad, paddingTop: t.padTop, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <PositionBadge position={player.position} size={compact ? 'sm' : 'md'} />
          <NationalityFlag nationality={player.nationality} width={t.flagW} radius={5} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          {/* Compare toggle */}
          <Pressable
            onPress={() => {
              if (inCompare) {
                removeFromCompare(player.id);
              } else if (!compareFull) {
                addToCompare({ ...detail, id: player.id, name: player.name, position: player.position, nationality: player.nationality, current_team_id: player.team_id, team_name: player.team_name } as never);
              }
            }}
            style={({ pressed }) => ({
              width: 28,
              height: 28,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: inCompare ? 'rgba(100,255,218,0.45)' : '#3C3C3C',
              backgroundColor: inCompare ? 'rgba(100,255,218,0.08)' : pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
              opacity: compareFull ? 0.35 : 1,
            })}
            accessibilityLabel={inCompare ? 'Quitar de comparación' : 'Agregar a comparación'}
          >
            {inCompare
              ? <CheckCircle size={14} color="#64ffda" />
              : <ArrowLeftRight size={14} color="#B8B8B8" />
            }
          </Pressable>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ color: '#717171', fontSize: t.valueLabel, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' }}>Valor</Text>
            <Text style={{ color: '#F2F2F2', fontWeight: '900', fontSize: t.valueSize, marginTop: 2 }}>
              {formatValue(detail?.market_value_eur)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Player row: photo + info ── */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: t.pad, paddingBottom: t.pad, gap: t.gapPhotoInfo }}>
        <View
          style={{
            width: t.photo, height: t.photo,
            borderRadius: t.photoRadius,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: hovered ? '#3C3C3C' : '#2C2C2C',
            backgroundColor: '#222222',
          }}
        >
          <Image
            source={{ uri: photoUrl }}
            style={{ width: t.photo, height: t.photo, transform: [{ scale: 1.28 }, { translateY: 4 }] }}
            contentFit="cover"
            transition={300}
            placeholder={{ blurhash: BLURHASH }}
          />
        </View>

        <View style={{ flex: 1, gap: compact ? 4 : 8 }}>
          <Text
            style={{ color: '#F2F2F2', fontWeight: '900', fontSize: t.nameSize, lineHeight: t.nameLeading, letterSpacing: -0.3 }}
            numberOfLines={1}
          >
            {player.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Text style={{ color: '#B8B8B8', fontSize: t.metaSize, fontWeight: '500' }}>
              {getAge(player.date_of_birth)}
            </Text>
            <View style={{ width: 3, height: 3, borderRadius: 99, backgroundColor: '#3C3C3C' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: compact ? 14 : 18, height: compact ? 14 : 18, borderRadius: 9, backgroundColor: '#2C2C2C', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                <Image source={{ uri: teamBadgeUrl }} style={{ width: compact ? 12 : 16, height: compact ? 12 : 16 }} contentFit="contain" />
              </View>
              <Text style={{ color: '#B8B8B8', fontSize: t.metaSize, fontWeight: '500' }} numberOfLines={1}>
                {player.team_name}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── Stats by position ── */}
      <View style={{ paddingHorizontal: t.pad, paddingBottom: compact ? 10 : 14 }}>
        <StatsByPosition position={player.position} stats={stats} compact={compact} />
      </View>

      {/* ── Rating section ── */}
      <View style={{ paddingHorizontal: t.pad, paddingBottom: t.pad, borderTopWidth: 1, borderTopColor: '#2C2C2C', paddingTop: compact ? 10 : 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: '#717171', fontSize: 9, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>Desempeño</Text>
          <View
            style={{
              backgroundColor: rating > 0 ? color : '#2C2C2C',
              borderRadius: 10,
              paddingHorizontal: t.ratingBadgePad,
              paddingVertical: 3,
              minWidth: 38,
              alignItems: 'center',
              ...(rating > 0
                ? { shadowColor: color, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 0 } }
                : {}),
            }}
          >
            <Text style={{ color: rating > 0 ? '#000' : '#717171', fontSize: t.badgeSize, fontWeight: '900' }}>
              {rating > 0 ? rating.toFixed(1) : '—'}
            </Text>
          </View>
        </View>
        <View style={{ height: compact ? 8 : 10, backgroundColor: '#222222', borderRadius: 99, overflow: 'hidden' }}>
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
      style={{
        width: compact ? '100%' : undefined,
        marginHorizontal: compact ? 0 : 12,
        marginBottom: compact ? 0 : 12,
      }}
      // @ts-expect-error web-only hover events
      onMouseEnter={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onMouseLeave={Platform.OS === 'web' ? () => setHovered(false) : undefined}
    >
      <FullCard player={player} hovered={hovered} compact={compact} />
    </Pressable>
  );
}
