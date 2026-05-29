import { useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useLeagueStandings } from '@/hooks/queries/use-league';
import { PREMIER_LEAGUE_ID } from '@/lib/bzzoiro/endpoints';
import { ClubCard } from '@/components/scout/club-card';
import type { StandingEntry } from '@/lib/bzzoiro/types';

export default function ClubsScreen() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const { data, isLoading } = useLeagueStandings(PREMIER_LEAGUE_ID);
  const teams: StandingEntry[] = data?.standings ?? [];

  const filtered = search.trim()
    ? teams.filter((t) => t.team_name.toLowerCase().includes(search.toLowerCase()))
    : teams;

  return (
    <View className="flex-1 bg-black">
      <Text className="text-white text-2xl font-black px-5 pt-4">Clubes</Text>
      <Text className="text-zinc-500 text-sm px-5 mb-3">20 equipos</Text>

      <TextInput
        className="bg-zinc-900 rounded-xl border border-zinc-800 p-3 mx-5 mb-3 text-white text-sm"
        placeholder="Buscar club..."
        placeholderTextColor="#71717a"
        value={search}
        onChangeText={setSearch}
      />

      <FlatList<StandingEntry>
        data={filtered}
        keyExtractor={(item) => String(item.team_id)}
        numColumns={2}
        columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => (
          <ClubCard
            entry={item}
            onPress={() => router.push(`/clubs/${item.team_id}` as never)}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center py-16">
              <ActivityIndicator color="#64ffda" />
            </View>
          ) : (
            <Text className="text-zinc-500 text-center py-16">
              No se encontraron clubes
            </Text>
          )
        }
      />
    </View>
  );
}
