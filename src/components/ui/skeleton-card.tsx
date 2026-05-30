import { View } from 'react-native';
import { ShimmerBox } from '@/components/ui/shimmer-box';

export function SkeletonCard() {
  return (
    <View
      style={{
        marginHorizontal: 12,
        marginBottom: 12,
        backgroundColor: '#1C1C1C',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2C2C2C',
        height: 300,
        justifyContent: 'space-between',
      }}
    >
      {/* Top bar: position + flag | compare button + valor */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ShimmerBox width={36} height={22} borderRadius={6} />
          <ShimmerBox width={34} height={22} borderRadius={5} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <ShimmerBox width={28} height={28} borderRadius={8} />
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <ShimmerBox width={28} height={9} borderRadius={4} />
            <ShimmerBox width={48} height={14} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Player row: square photo + info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
        <ShimmerBox width={68} height={68} borderRadius={14} />
        <View style={{ flex: 1, gap: 8 }}>
          <ShimmerBox width="70%" height={16} borderRadius={6} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShimmerBox width={30} height={12} borderRadius={4} />
            <ShimmerBox width={18} height={18} borderRadius={9} />
            <ShimmerBox width="40%" height={12} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2C2C2C', paddingHorizontal: 16, paddingVertical: 14, gap: 16 }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ flex: 1, gap: 6 }}>
            <ShimmerBox width="60%" height={9} borderRadius={4} />
            <ShimmerBox width="40%" height={20} borderRadius={5} />
          </View>
        ))}
      </View>

      {/* Rating section: label + badge row, then bar */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#2C2C2C' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <ShimmerBox width={64} height={9} borderRadius={4} />
          <ShimmerBox width={38} height={24} borderRadius={10} />
        </View>
        <ShimmerBox width="100%" height={10} borderRadius={99} />
      </View>
    </View>
  );
}

export function SkeletonCardCompact() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#1C1C1C',
        borderRadius: 18,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#2C2C2C',
        height: 280,
        justifyContent: 'space-between',
      }}
    >
      {/* Top bar: position + flag | compare + valor */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <ShimmerBox width={30} height={18} borderRadius={5} />
          <ShimmerBox width={28} height={18} borderRadius={4} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
          <ShimmerBox width={28} height={28} borderRadius={8} />
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <ShimmerBox width={24} height={8} borderRadius={3} />
            <ShimmerBox width={40} height={13} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Player row: square photo + info */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 14, gap: 12 }}>
        <ShimmerBox width={60} height={60} borderRadius={12} />
        <View style={{ flex: 1, gap: 4 }}>
          <ShimmerBox width="70%" height={15} borderRadius={6} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <ShimmerBox width={26} height={11} borderRadius={4} />
            <ShimmerBox width={14} height={14} borderRadius={7} />
            <ShimmerBox width="40%" height={11} borderRadius={4} />
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#2C2C2C', paddingHorizontal: 14, paddingVertical: 10, gap: 12 }}>
        {[0, 1].map((i) => (
          <View key={i} style={{ flex: 1, gap: 5 }}>
            <ShimmerBox width="60%" height={9} borderRadius={4} />
            <ShimmerBox width="40%" height={18} borderRadius={5} />
          </View>
        ))}
      </View>

      {/* Rating section */}
      <View style={{ paddingHorizontal: 14, paddingBottom: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2C2C2C' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <ShimmerBox width={56} height={9} borderRadius={4} />
          <ShimmerBox width={34} height={22} borderRadius={10} />
        </View>
        <ShimmerBox width="100%" height={8} borderRadius={99} />
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
