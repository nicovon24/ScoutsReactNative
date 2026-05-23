import { View, Text } from 'react-native';

interface RatingBarProps {
  value: number;
  maxValue?: number;
  showLabel?: boolean;
  showBadge?: boolean;
}

function ratingGradient(r: number, max: number): string {
  const pct = r / max;
  if (pct >= 0.75) return '#64ffda';
  if (pct >= 0.70) return '#E8A838';
  if (pct >= 0.65) return '#F0A04B';
  return '#ef4444';
}

export function RatingBar({ value, maxValue = 10, showLabel = true, showBadge = false }: RatingBarProps) {
  const pct = Math.min(Math.max(value / maxValue, 0), 1);
  const color = ratingGradient(value, maxValue);
  const displayValue = value.toFixed(1);

  return (
    <View className="gap-2">
      {showLabel && (
        <View className="flex-row justify-between items-end">
          <Text className="text-muted text-2xs uppercase font-bold tracking-widest">Desempeño</Text>
          {showBadge && (
            <View style={{ backgroundColor: color, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, minWidth: 36, alignItems: 'center' }}>
              <Text style={{ color: '#000', fontSize: 13, fontWeight: '800' }}>{displayValue}</Text>
            </View>
          )}
          {!showBadge && (
            <Text className="text-primary text-xs font-black">{displayValue}</Text>
          )}
        </View>
      )}

      {/* Bar with reference markers */}
      <View className="h-3 bg-card-2 border border-border rounded-full overflow-hidden">
        {/* Reference markers */}
        <View className="absolute inset-0 flex-row justify-around px-[12%] pointer-events-none">
          {[0, 1, 2].map((i) => (
            <View key={i} className="w-px h-full bg-border-h opacity-60" />
          ))}
        </View>
        <View
          style={{
            height: '100%',
            width: `${pct * 100}%`,
            backgroundColor: color,
            borderRadius: 99,
          }}
        />
      </View>
    </View>
  );
}
