import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { nationalityToFlagUrl } from '@/lib/country-flags';

interface NationalityFlagProps {
  nationality: string | null | undefined;
  /** Width in px (height auto-calculated at 2:3 ratio). Default 28. */
  width?: number;
  /** Border radius — default 4 for pill-ish look */
  radius?: number;
}

export function NationalityFlag({ nationality, width = 28, radius = 4 }: NationalityFlagProps) {
  const url = nationalityToFlagUrl(nationality, 80);
  const height = Math.round(width * 0.66);

  if (!url) {
    return nationality ? (
      <Text className="text-muted text-[10px] font-medium" numberOfLines={1}>
        {nationality}
      </Text>
    ) : null;
  }

  return (
    <View style={{ width, height, borderRadius: radius, overflow: 'hidden', backgroundColor: '#222' }}>
      <Image source={{ uri: url }} style={{ width, height }} contentFit="cover" />
    </View>
  );
}
