import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Clock } from 'lucide-react-native';
import { useLeagueStandings } from '@/hooks/queries/use-league';
import { useTeamSquad } from '@/hooks/queries/use-team-squad';
import { PREMIER_LEAGUE_ID, getStandings } from '@/lib/bzzoiro/endpoints';
import { PitchFormation } from '@/components/scout/pitch-formation';
import type { SquadPlayer } from '@/lib/bzzoiro/types';

export async function generateStaticParams(): Promise<Record<string, string>[]> {
  const standings = await getStandings();
  return standings.standings.map((t) => ({ id: String(t.team_id) }));
}

type Tab = 'plantilla' | 'partidos' | 'alineacion';

const POSITION_LABELS: Record<string, string> = {
  G: 'Porteros',
  D: 'Defensores',
  M: 'Centrocampistas',
  F: 'Delanteros',
  '': 'Sin posicion',
};

const POSITION_ORDER: Array<SquadPlayer['position']> = ['G', 'D', 'M', 'F', ''];

function groupByPosition(players: SquadPlayer[]): Array<{ pos: SquadPlayer['position']; items: SquadPlayer[] }> {
  const map: Partial<Record<SquadPlayer['position'], SquadPlayer[]>> = {};
  for (const p of players) {
    if (!map[p.position]) map[p.position] = [];
    map[p.position]!.push(p);
  }
  return POSITION_ORDER
    .filter((pos) => map[pos] && map[pos]!.length > 0)
    .map((pos) => ({ pos, items: map[pos]! }));
}

export default function ClubDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamId = Number(id);
  const [tab, setTab] = useState<Tab>('plantilla');

  const { data: standingsData } = useLeagueStandings(PREMIER_LEAGUE_ID);
  const { data: squadData, isLoading: squadLoading } = useTeamSquad(teamId);

  const teamEntry = standingsData?.standings.find((t) => t.team_id === teamId);

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: 'plantilla', label: 'Plantilla' },
    { key: 'partidos', label: 'Partidos' },
    { key: 'alineacion', label: 'Alineacion' },
  ];

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="pt-12 pb-4 px-4">
        <Pressable
          className="p-1 self-start mb-3"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/clubs'))}
        >
          <ChevronLeft color="#f4f4f5" size={22} />
        </Pressable>

        <View className="flex-row items-center gap-3">
          <Image
            className="w-14 h-14"
            contentFit="contain"
            source={{ uri: `https://sports.bzzoiro.com/img/team/${teamId}/` }}
          />
          <View className="flex-1">
            <Text className="text-white text-[22px] font-black">
              {teamEntry?.team_name ?? '—'}
            </Text>
            {teamEntry && (
              <Text className="text-zinc-500 text-sm">
                #{teamEntry.position} · {teamEntry.pts} pts
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Tab bar */}
      <View className="flex-row border-b border-zinc-800 mt-4">
        {tabs.map(({ key, label }) => {
          const active = tab === key;
          return (
            <Pressable
              key={key}
              className="flex-1 py-3 items-center"
              style={active ? { borderBottomWidth: 2, borderBottomColor: '#64ffda' } : undefined}
              onPress={() => setTab(key)}
            >
              <Text
                className={active ? 'text-sm font-bold' : 'text-zinc-500 text-sm font-bold'}
                style={active ? { color: '#64ffda' } : undefined}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Tab content */}
      {tab === 'plantilla' && (
        <ScrollView className="flex-1">
          {squadLoading ? (
            <View className="items-center justify-center p-8">
              <ActivityIndicator color="#64ffda" />
            </View>
          ) : (
            groupByPosition(squadData?.players ?? []).map(({ pos, items }) => (
              <View key={pos}>
                <Text className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-2 px-5 pt-4">
                  {POSITION_LABELS[pos]}
                </Text>
                {items.map((p) => (
                  <View
                    key={p.id}
                    className="flex-row items-center gap-2.5 py-2 px-5 border-b border-zinc-800"
                  >
                    <Image
                      className="w-8 h-8 rounded-full bg-zinc-800"
                      contentFit="cover"
                      source={{ uri: `https://sports.bzzoiro.com/img/player/${p.id}/` }}
                    />
                    <Text className="text-zinc-500 text-xs w-6 text-center">
                      {p.jersey_number ?? '—'}
                    </Text>
                    <Text className="text-white text-[13px] font-bold flex-1">{p.name}</Text>
                    <Text className="text-zinc-500 text-[11px]">{p.nationality}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}

      {tab === 'partidos' && (
        <View className="flex-1 items-center justify-center p-8 gap-3">
          <Clock size={32} color="#71717a" />
          <Text className="text-white text-base font-black">Proximamente</Text>
          <Text className="text-zinc-500 text-[13px] text-center leading-5">
            Los partidos de este club no estan disponibles en esta version.
          </Text>
        </View>
      )}

      {tab === 'alineacion' && (
        <ScrollView className="flex-1 p-4">
          {squadLoading ? (
            <View className="items-center justify-center p-8">
              <ActivityIndicator color="#64ffda" />
            </View>
          ) : (
            <>
              <PitchFormation players={squadData?.players ?? []} />
              <Text className="text-zinc-500 text-xs text-center mt-2 px-5">
                Formacion estimada basada en la plantilla del club.
              </Text>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
