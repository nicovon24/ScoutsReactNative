import { Pressable, Text } from 'react-native';
import { Image } from 'expo-image';
import type { StandingEntry } from '@/lib/bzzoiro/types';

interface ClubCardProps {
  entry: StandingEntry;
  onPress: () => void;
}

export function ClubCard({ entry, onPress }: ClubCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 items-center gap-2 flex-1"
    >
      <Image
        source={{ uri: `https://sports.bzzoiro.com/img/team/${entry.team_id}/` }}
        className="w-[52px] h-[52px]"
        contentFit="contain"
      />
      <Text
        className="text-white text-[13px] font-black text-center"
        numberOfLines={2}
      >
        {entry.team_name}
      </Text>
      <Text className="text-zinc-500 text-[11px] text-center">
        {`#${entry.position}  ·  ${entry.pts} pts`}
      </Text>
    </Pressable>
  );
}
