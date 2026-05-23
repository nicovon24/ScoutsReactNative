import { View } from 'react-native';
import { ShimmerBox } from '@/components/ui/shimmer-box';

export function SkeletonCard() {
  return (
    <View className="mx-3 mb-3 bg-zinc-900 rounded-2xl overflow-hidden" style={{ borderWidth: 1.5, borderColor: '#27272a' }}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-3 pt-3 pb-2">
        <View className="flex-row gap-2">
          <ShimmerBox width={32} height={20} borderRadius={5} />
          <ShimmerBox width={60} height={14} borderRadius={5} />
        </View>
        <View className="items-end gap-1">
          <ShimmerBox width={28} height={9} borderRadius={4} />
          <ShimmerBox width={44} height={14} borderRadius={4} />
        </View>
      </View>

      {/* Player row */}
      <View className="flex-row items-center px-3 pb-3 gap-3">
        <ShimmerBox width={64} height={64} borderRadius={32} />
        <View className="flex-1 gap-1.5">
          <ShimmerBox width="70%" height={15} borderRadius={6} />
          <ShimmerBox width="30%" height={11} borderRadius={5} />
          <ShimmerBox width="50%" height={11} borderRadius={5} />
        </View>
      </View>

      {/* Stats row */}
      <View className="flex-row border-t border-zinc-800 px-3 py-3 gap-4">
        {[0, 1].map((i) => (
          <View key={i} className="flex-1 gap-1.5">
            <ShimmerBox width="60%" height={9} borderRadius={4} />
            <ShimmerBox width="40%" height={20} borderRadius={5} />
          </View>
        ))}
      </View>

      {/* Rating bar */}
      <View className="flex-row items-center px-3 pb-3 pt-2 gap-3 border-t border-zinc-800">
        <ShimmerBox width={60} height={9} borderRadius={4} />
        <View className="flex-1">
          <ShimmerBox width="100%" height={6} borderRadius={3} />
        </View>
        <ShimmerBox width={36} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

export function SkeletonCardCompact() {
  return (
    <View className="flex-1 m-1 bg-zinc-900 rounded-2xl overflow-hidden" style={{ borderWidth: 1.5, borderColor: '#27272a' }}>
      {/* Top bar */}
      <View className="flex-row items-center justify-between px-2.5 pt-2.5">
        <ShimmerBox width={28} height={16} borderRadius={4} />
        <View className="items-end gap-1">
          <ShimmerBox width={24} height={8} borderRadius={3} />
          <ShimmerBox width={36} height={11} borderRadius={4} />
        </View>
      </View>
      {/* Photo + name */}
      <View className="items-center px-2 pt-1.5 pb-2 gap-1.5">
        <ShimmerBox width={56} height={56} borderRadius={28} />
        <ShimmerBox width="80%" height={11} borderRadius={4} />
        <ShimmerBox width="55%" height={9} borderRadius={3} />
        <ShimmerBox width="40%" height={8} borderRadius={3} />
      </View>
      {/* Stats */}
      <View className="flex-row border-t border-zinc-800 px-2.5 py-2 gap-1">
        {[0, 1].map((i) => (
          <View key={i} className="flex-1 items-center gap-1">
            <ShimmerBox width="40%" height={13} borderRadius={4} />
            <ShimmerBox width="70%" height={7} borderRadius={3} />
          </View>
        ))}
      </View>
      {/* Rating */}
      <View className="flex-row items-center border-t border-zinc-800 px-2.5 py-2 gap-2">
        <View className="flex-1">
          <ShimmerBox width="100%" height={4} borderRadius={2} />
        </View>
        <ShimmerBox width={32} height={18} borderRadius={9} />
      </View>
    </View>
  );
}

interface SkeletonGridProps {
  count: number;
  numColumns: number;
}

export function SkeletonGrid({ count, numColumns }: SkeletonGridProps) {
  if (numColumns === 1) {
    return (
      <>
        {Array.from({ length: count }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </>
    );
  }

  const rows: number[][] = [];
  for (let i = 0; i < count; i += numColumns) {
    rows.push(Array.from({ length: numColumns }, (_, j) => i + j));
  }

  return (
    <>
      {rows.map((row, ri) => (
        <View key={ri} className="flex-row px-2.5">
          {row.map((idx) => (
            <SkeletonCardCompact key={idx} />
          ))}
        </View>
      ))}
    </>
  );
}
