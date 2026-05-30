import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { ChevronRight } from 'lucide-react-native';
import type { StandingEntry } from '@/lib/bzzoiro/types';

interface ClubCardProps {
  entry: StandingEntry;
  onPress: () => void;
}

export function ClubCard({ entry, onPress }: ClubCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 items-center gap-3 flex-1"
    >
      <Image
        source={{ uri: `https://sports.bzzoiro.com/img/team/${entry.team_id}/` }}
        className="w-[56px] h-[56px]"
        contentFit="contain"
      />
      <Text
        className="text-white text-[13px] font-black text-center leading-[18px]"
        numberOfLines={2}
      >
        {entry.team_name}
      </Text>
      <View className="flex-row items-center gap-1">
        <Text className="text-zinc-500 text-[11px] text-center">
          {`#${entry.position}  ·  ${entry.pts} pts`}
        </Text>
        <ChevronRight size={12} color="#52525b" />
      </View>
    </Pressable>
  );
}
