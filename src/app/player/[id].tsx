import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';

import { usePlayerDetail, usePlayerStats } from '@/hooks/queries/use-player-detail';
import { PositionBadge } from '@/components/scout/position-badge';
import { RatingBar } from '@/components/scout/rating-bar';

function getAge(dob: string | null): number | null {
  if (!dob) return null;
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

function formatValue(eur: number | null | undefined): string {
  if (eur == null) return 'N/D';
  if (eur >= 1_000_000) return `€${(eur / 1_000_000).toFixed(1)}M`;
  if (eur >= 1_000) return `€${Math.round(eur / 1_000)}K`;
  return `€${eur}`;
}

interface StatRowProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

function StatRow({ label, value, accent }: StatRowProps) {
  return (
    <View className="flex-row justify-between items-center py-2.5 border-b border-zinc-800">
      <Text className="text-zinc-400 text-sm">{label}</Text>
      <Text className={`text-sm font-semibold ${accent ? 'text-green' : 'text-white'}`}>
        {value}
      </Text>
    </View>
  );
}

interface SkillRadarProps {
  stats: {
    goals: number;
    assists: number;
    xG: number;
    avgRating: number;
    tackles: number;
    interceptions: number;
  };
}

function SkillRadar({ stats }: SkillRadarProps) {
  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const r = 70;
  const numAxes = 5;
  const labels = ['Goles', 'Asist', 'xG', 'Rating', 'Tackl'];
  const rawValues = [
    stats.goals / 20,
    stats.assists / 15,
    stats.xG / 20,
    stats.avgRating / 10,
    stats.tackles / 100,
  ].map((v) => Math.min(Math.max(v, 0), 1));

  function axisPoint(idx: number, scale: number) {
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = rawValues.map((v, i) => axisPoint(i, v));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size}>
      {gridLevels.map((level) => {
        const pts = Array.from({ length: numAxes }, (_, i) => axisPoint(i, level));
        const polygon = pts.map((p) => `${p.x},${p.y}`).join(' ');
        return (
          <Polygon
            key={level}
            points={polygon}
            fill="none"
            stroke="#27272a"
            strokeWidth={1}
          />
        );
      })}
      {Array.from({ length: numAxes }, (_, i) => {
        const tip = axisPoint(i, 1);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={tip.x}
            y2={tip.y}
            stroke="#3f3f46"
            strokeWidth={1}
          />
        );
      })}
      <Polygon
        points={dataPolygon}
        fill="rgba(163,255,18,0.15)"
        stroke="#64ffda"
        strokeWidth={2}
      />
      {dataPoints.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3} fill="#64ffda" />
      ))}
      {Array.from({ length: numAxes }, (_, i) => {
        const labelPt = axisPoint(i, 1.22);
        return (
          <SvgText
            key={i}
            x={labelPt.x}
            y={labelPt.y}
            fontSize={9}
            fill="#a1a1aa"
            textAnchor="middle"
            alignmentBaseline="middle"
          >
            {labels[i]}
          </SvgText>
        );
      })}
    </Svg>
  );
}

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const playerId = Number(id);

  const { data: player, isLoading: loadingPlayer } = usePlayerDetail(playerId);
  const { data: statsData, isLoading: loadingStats } = usePlayerStats(playerId);

  const stats = statsData?.aggregated;
  const isLoading = loadingPlayer || loadingStats;
  const photoUrl = `https://sports.bzzoiro.com/img/player/${playerId}/`;

  return (
    <SafeAreaView className="flex-1 bg-zinc-950" edges={['top']}>
      {/* Back button */}
      <Pressable onPress={() => router.back()} className="px-4 py-3 flex-row items-center gap-2">
        <Text className="text-green text-base">{'←'}</Text>
        <Text className="text-zinc-400 text-sm">Volver</Text>
      </Pressable>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#64ffda" />
        </View>
      ) : !player ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-zinc-400">Jugador no encontrado</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          {/* Hero */}
          <View className="px-4 pb-4">
            <View className="flex-row items-center gap-4">
              <Image
                source={{ uri: photoUrl }}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                contentFit="cover"
                placeholder={require('@/assets/images/react-logo.png')}
              />
              <View className="flex-1 gap-1.5">
                <Text className="text-white text-xl font-bold leading-tight">
                  {player.name}
                </Text>
                <View className="flex-row items-center gap-2">
                  <PositionBadge position={player.position} size="md" />
                  <Text className="text-zinc-400 text-sm">{player.nationality}</Text>
                </View>
                {player.current_team_id && (
                  <Text className="text-zinc-400 text-sm">
                    #{player.jersey_number ?? '—'}
                  </Text>
                )}
              </View>
              {stats?.avgRating ? (
                <View className="bg-zinc-900 rounded-xl p-3 items-center">
                  <Text className="text-green text-2xl font-bold">
                    {stats.avgRating.toFixed(1)}
                  </Text>
                  <Text className="text-zinc-500 text-[10px] uppercase">Rating</Text>
                </View>
              ) : null}
            </View>

            {stats?.avgRating ? (
              <View className="mt-3">
                <RatingBar value={stats.avgRating} maxValue={10} showLabel={false} />
              </View>
            ) : null}
          </View>

          {/* Stats summary */}
          {stats && (
            <View className="mx-4 bg-zinc-900 rounded-xl p-4 mb-4">
              <Text className="text-zinc-400 text-xs uppercase tracking-wider mb-3">
                Temporada actual
              </Text>
              <View className="flex-row justify-around">
                {[
                  { label: 'Goles', value: stats.goals },
                  { label: 'Asistencias', value: stats.assists },
                  { label: 'xG', value: stats.xG },
                  { label: 'Partidos', value: stats.matches },
                ].map((s) => (
                  <View key={s.label} className="items-center">
                    <Text className="text-white text-xl font-bold">{s.value}</Text>
                    <Text className="text-zinc-500 text-[10px] uppercase">{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Radar */}
          {stats && (
            <View className="mx-4 bg-zinc-900 rounded-xl p-4 mb-4 items-center">
              <Text className="text-zinc-400 text-xs uppercase tracking-wider mb-3 self-start">
                Perfil de rendimiento
              </Text>
              <SkillRadar stats={stats} />
            </View>
          )}

          {/* Bio */}
          <View className="mx-4 bg-zinc-900 rounded-xl px-4 pb-2 mb-4">
            <Text className="text-zinc-400 text-xs uppercase tracking-wider py-3">
              Perfil del jugador
            </Text>
            <StatRow label="Edad" value={getAge(player.date_of_birth) ?? 'N/D'} />
            <StatRow label="Altura" value={player.height_cm ? `${player.height_cm} cm` : 'N/D'} />
            <StatRow label="Pie preferido" value={player.preferred_foot || 'N/D'} />
            <StatRow
              label="Valor de mercado"
              value={formatValue(player.market_value_eur)}
              accent
            />
            <StatRow
              label="Contrato hasta"
              value={
                player.contract_until
                  ? new Date(player.contract_until).getFullYear().toString()
                  : 'N/D'
              }
            />
            <StatRow label="Disponibilidad" value={player.availability ?? 'N/D'} />
          </View>

          {/* Defensive stats */}
          {stats && (
            <View className="mx-4 bg-zinc-900 rounded-xl px-4 pb-2">
              <Text className="text-zinc-400 text-xs uppercase tracking-wider py-3">
                Estadisticas defensivas
              </Text>
              <StatRow label="Tackles" value={stats.tackles} />
              <StatRow label="Intercepciones" value={stats.interceptions} />
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
