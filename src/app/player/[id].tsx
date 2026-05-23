import { View, Text, ScrollView, ActivityIndicator, Pressable, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';

import { usePlayerDetail, usePlayerStats } from '@/hooks/queries/use-player-detail';
import { PositionBadge } from '@/components/scout/position-badge';
import { NationalityFlag } from '@/components/scout/nationality-flag';
import { RatingBar } from '@/components/scout/rating-bar';
import { DonutCircle } from '@/components/scout/donut-circle';
import { SkillRadar } from '@/components/scout/skill-radar';
import { RatingEvolution } from '@/components/scout/rating-evolution';
import {
  formatMarketValue,
  formatFoot,
  getAge,
  ratingColor,
  getQuickStats,
  getKeyStats,
  getDonutValues,
  getStatSections,
  getRadarPoints,
  getRatingEvolution,
  getBioRows,
  type StatSection,
} from '@/lib/player-detail';
import { getLeaguePlayerIds } from '@/lib/static-params';

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  const ids = await getLeaguePlayerIds();
  return ids.map((id) => ({ id: String(id) }));
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const C = {
  bg:       '#0F0F0F',
  surface:  '#161616',
  card:     '#1C1C1C',
  border:   '#2C2C2C',
  borderH:  '#3C3C3C',
  primary:  '#F2F2F2',
  secondary:'#B8B8B8',
  muted:    '#717171',
  green:    '#64ffda',
  gold:     '#E8A838',
  danger:   '#F04444',
};

// ── Shared primitives ─────────────────────────────────────────────────────────

function SectionTitle({ title, accent = C.green }: { title: string; accent?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <Text style={{ color: accent, fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>
        {title}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
    </View>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <View style={{ backgroundColor: C.surface, borderRadius: 16, borderWidth: 1, borderColor: C.border, padding: 16, ...style }}>
      {children}
    </View>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
      <Text style={{ color: C.secondary, fontSize: 13 }}>{label}</Text>
      <Text style={{ color: accent ? C.green : C.primary, fontSize: 13, fontWeight: '700' }}>
        {value}
      </Text>
    </View>
  );
}

function StatSectionCard({ section }: { section: StatSection }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, marginTop: 4 }}>
        <Text style={{ color: section.accent, fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>
          {section.title}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: C.border }} />
      </View>
      {section.rows.map((row, i) => {
        const rawVal = typeof row.value === 'number' ? row.value : parseFloat(String(row.value));
        const pct = isNaN(rawVal) ? 0 : Math.min(100, (rawVal / row.max) * 100);
        return (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.border }}>
            <Text style={{ color: C.secondary, fontSize: 12, flex: 1 }}>{row.label}</Text>
            <Text style={{ color: C.primary, fontSize: 12, fontWeight: '700', width: 44, textAlign: 'right' }}>
              {row.value}
            </Text>
            <View style={{ width: 80, height: 4, backgroundColor: C.card, borderRadius: 99, overflow: 'hidden' }}>
              <View style={{ height: '100%', width: `${pct}%`, backgroundColor: section.accent, borderRadius: 99 }} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PlayerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const playerId = Number(id);
  const { data: player, isLoading: loadingPlayer } = usePlayerDetail(playerId);
  const { data: statsData, isLoading: loadingStats } = usePlayerStats(playerId);

  const stats = statsData?.aggregated;
  const raw   = statsData?.raw ?? [];
  const isLoading = loadingPlayer || loadingStats;
  const photoUrl = `https://sports.bzzoiro.com/img/player/${playerId}/`;
  const teamLogoUrl = player?.current_team_id
    ? `https://sports.bzzoiro.com/img/team/${player.current_team_id}/`
    : null;

  // ── Loading / error states ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.green} />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: C.muted }}>Jugador no encontrado</Text>
      </View>
    );
  }

  // ── Data derivation ─────────────────────────────────────────────────────────
  const age        = getAge(player.date_of_birth);
  const mainRating = stats?.avgRating ?? 0;
  const rColor     = ratingColor(mainRating);
  const quickStats = stats ? getQuickStats(player.position, stats, player.market_value_eur) : [];
  const keyStats   = stats && raw.length > 0 ? getKeyStats(player.position, stats, raw) : [];
  const donuts     = stats && raw.length > 0 ? getDonutValues(player.position, stats, raw) : [];
  const sections   = stats && raw.length > 0 ? getStatSections(player.position, stats, raw) : [];
  const radarPts   = stats && raw.length > 0 ? getRadarPoints(player.position, stats, raw) : [];
  const evolution  = getRatingEvolution(raw);
  const bioRows    = getBioRows(player);

  const maxW = isWide ? Math.min(width - 64, 1200) : width - 32;
  const hPad = isWide ? 32 : 16;
  const goToPlayers = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingHorizontal: hPad, paddingTop: 16, paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ maxWidth: maxW, alignSelf: 'center', width: '100%', gap: 16 }}>

        {/* Back button */}
        <Pressable
          onPress={goToPlayers}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 6,
            alignSelf: 'flex-start',
            backgroundColor: pressed ? C.card : C.surface,
            borderWidth: 1, borderColor: C.border,
            borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
          })}
        >
          <ChevronLeft size={14} color={C.green} />
          <Text style={{ color: C.secondary, fontSize: 13, fontWeight: '600' }}>Todos los jugadores</Text>
        </Pressable>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <Card>
          <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16, alignItems: isWide ? 'flex-start' : 'stretch' }}>

            {/* Avatar */}
            <View style={{ position: 'relative', alignSelf: isWide ? 'flex-start' : 'center' }}>
              <View style={{
                width: isWide ? 120 : 80,
                height: isWide ? 120 : 80,
                borderRadius: 16,
                borderWidth: 2, borderColor: C.border,
                overflow: 'hidden',
                backgroundColor: C.card,
              }}>
                <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              {/* Position + age + foot + height */}
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                <PositionBadge position={player.position} size="md" />
                {age != null && <Text style={{ color: C.muted, fontSize: 13 }}>{age} años</Text>}
                {player.preferred_foot ? <Text style={{ color: C.muted, fontSize: 13 }}>· {formatFoot(player.preferred_foot)}</Text> : null}
                {player.height_cm ? <Text style={{ color: C.muted, fontSize: 13 }}>· {player.height_cm} cm</Text> : null}
              </View>

              {/* Name */}
              <Text style={{ color: C.primary, fontSize: isWide ? 28 : 20, fontWeight: '900', lineHeight: isWide ? 34 : 24, marginBottom: 8 }}>
                {player.name}
              </Text>

              {/* Team + nationality */}
              <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
                {teamLogoUrl && player.team_name && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Image source={{ uri: teamLogoUrl }} style={{ width: 16, height: 16 }} contentFit="contain" />
                    <Text style={{ color: C.secondary, fontSize: 13 }}>{player.team_name}</Text>
                  </View>
                )}
                {player.nationality && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <NationalityFlag nationality={player.nationality} width={22} radius={3} />
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Rating bar */}
          {mainRating > 0 && (
            <View style={{ marginTop: 16 }}>
              <Text style={{ color: C.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>
                Desempeño
              </Text>
              <RatingBar value={mainRating} maxValue={10} showLabel={false} showBadge />
            </View>
          )}

          {/* Quick stats row */}
          {quickStats.length > 0 && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 0, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border }}>
              {mainRating > 0 && (
                <View style={{ alignItems: 'center', marginRight: 20 }}>
                  <Text style={{ color: rColor, fontSize: isWide ? 26 : 18, fontWeight: '900', lineHeight: isWide ? 30 : 22 }}>
                    {mainRating.toFixed(1)}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Rating
                  </Text>
                </View>
              )}
              {quickStats.map((q, i) => (
                <View key={i} style={{ alignItems: 'center', marginRight: 20, marginBottom: 4 }}>
                  <Text style={{ color: q.accent ?? C.primary, fontSize: isWide ? 22 : 15, fontWeight: '800', lineHeight: isWide ? 26 : 18 }}>
                    {q.value}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 9, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 }}>
                    {q.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card>

        {/* ── ROW 2: Bio + Key stats ───────────────────────────────────────── */}
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>

          {/* Bio */}
          <Card style={{ flex: 1 }}>
            <SectionTitle title="Perfil del jugador" />
            {bioRows.map((r, i) => (
              <StatRow key={i} label={r.label} value={r.value} accent={r.accent} />
            ))}
          </Card>

          {/* Key stats 2×2 */}
          {keyStats.length > 0 && (
            <Card style={{ flex: 1 }}>
              <SectionTitle title="Stats clave" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {keyStats.map((k, i) => (
                  <View
                    key={i}
                    style={{
                      width: '47%',
                      backgroundColor: C.card,
                      borderRadius: 12,
                      borderWidth: 1, borderColor: C.border,
                      padding: 12,
                    }}
                  >
                    <Text style={{ color: k.accent, fontSize: 22, fontWeight: '900', lineHeight: 26 }}>
                      {k.value}
                    </Text>
                    <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 }}>
                      {k.label}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>

        {/* ── Rendimiento Técnico (donuts) ─────────────────────────────────── */}
        {donuts.length > 0 && (
          <Card>
            <SectionTitle title="Rendimiento Técnico" />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 20, paddingVertical: 8 }}>
              {donuts.map((d, i) => (
                <DonutCircle key={i} value={d.value} label={d.label} color={d.color} size={isWide ? 110 : 88} />
              ))}
            </View>
          </Card>
        )}

        {/* ── Radar + Evolución rating ─────────────────────────────────────── */}
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>
          {radarPts.length > 0 && (
            <Card style={{ flex: 1, alignItems: 'center' }}>
              <SectionTitle title="Radar de rendimiento" />
              <SkillRadar points={radarPts} size={Math.min(280, (width - 128) / (isWide ? 2 : 1))} />
            </Card>
          )}
          {evolution.length > 0 && (
            <Card style={{ flex: 1 }}>
              <SectionTitle title="Evolución del rating" />
              <Text style={{ color: C.muted, fontSize: 10, marginBottom: 8 }}>
                Últimos {evolution.length} partidos
              </Text>
              <RatingEvolution data={evolution} />
            </Card>
          )}
        </View>

        {/* ── Estadísticas completas ───────────────────────────────────────── */}
        {sections.length > 0 && (
          <Card>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <Text style={{ color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>
                Estadísticas completas
              </Text>
              <View style={{ backgroundColor: C.card, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ color: C.secondary, fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  {player.position || '—'}
                </Text>
              </View>
            </View>
            {isWide ? (
              // 2-col on wide screens
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <View style={{ flex: 1 }}>
                  {sections.slice(0, Math.ceil(sections.length / 2)).map((s, i) => (
                    <StatSectionCard key={i} section={s} />
                  ))}
                </View>
                <View style={{ width: 1, backgroundColor: C.border }} />
                <View style={{ flex: 1 }}>
                  {sections.slice(Math.ceil(sections.length / 2)).map((s, i) => (
                    <StatSectionCard key={i} section={s} />
                  ))}
                </View>
              </View>
            ) : (
              sections.map((s, i) => <StatSectionCard key={i} section={s} />)
            )}
          </Card>
        )}

      </View>
    </ScrollView>
  );
}
