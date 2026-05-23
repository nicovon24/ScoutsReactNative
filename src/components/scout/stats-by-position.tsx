import { View, Text } from 'react-native';
import type { AggregatedStats } from '@/lib/bzzoiro/types';

interface StatItemProps {
  label: string;
  value: string | number;
  compact?: boolean;
}

function StatItem({ label, value, compact }: StatItemProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: compact ? 3 : 6 }}>
      <Text
        style={{ color: '#717171', fontSize: compact ? 8 : 10, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' }}
        numberOfLines={1}
      >
        {label}
      </Text>
      <Text style={{ color: '#F2F2F2', fontWeight: '900', fontSize: compact ? 14 : 18, lineHeight: compact ? 16 : 20 }}>
        {value}
      </Text>
    </View>
  );
}

function Divider({ compact }: { compact?: boolean }) {
  return <View style={{ width: 1, height: compact ? 22 : 32, backgroundColor: '#2C2C2C' }} />;
}

interface StatsByPositionProps {
  position: string;
  stats: AggregatedStats | undefined;
  compact?: boolean;
}

function dash(stats: AggregatedStats | undefined, v: number | undefined): string | number {
  return stats ? (v ?? 0) : '—';
}

export function StatsByPosition({ position, stats, compact = false }: StatsByPositionProps) {
  const savePct =
    stats && stats.saves + stats.goalsConceded > 0
      ? ((stats.saves / (stats.saves + stats.goalsConceded)) * 100).toFixed(0) + '%'
      : '—';

  let slots: Array<{ label: string; value: string | number }>;

  if (position === 'G') {
    slots = [
      { label: 'Atajadas', value: dash(stats, stats?.saves) },
      { label: '% Atj.',   value: savePct },
      { label: 'V. Inv.',  value: dash(stats, stats?.cleanSheets) },
    ];
  } else if (position === 'D') {
    slots = [
      { label: 'Tackles',  value: dash(stats, stats?.tackles) },
      { label: 'Intercep', value: dash(stats, stats?.interceptions) },
      { label: 'Despejes', value: dash(stats, stats?.clearances) },
    ];
  } else if (position === 'M') {
    slots = [
      { label: 'Goles', value: dash(stats, stats?.goals) },
      { label: 'Asist', value: dash(stats, stats?.assists) },
      { label: 'xG',    value: dash(stats, stats?.xG) },
    ];
  } else {
    slots = [
      { label: 'Goles', value: dash(stats, stats?.goals) },
      { label: 'Asist', value: dash(stats, stats?.assists) },
      { label: 'xG',    value: dash(stats, stats?.xG) },
    ];
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: compact ? 4 : 8 }}>
      {slots.map((s, i) => (
        <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {i > 0 && <Divider compact={compact} />}
          <StatItem label={s.label} value={s.value} compact={compact} />
        </View>
      ))}
    </View>
  );
}
