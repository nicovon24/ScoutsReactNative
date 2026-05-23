import { View, Text } from 'react-native';
import type { AggregatedStats } from '@/lib/bzzoiro/types';

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <View className="flex-1 items-center gap-1.5">
      <Text className="text-muted text-2xs uppercase font-bold tracking-widest" numberOfLines={1}>
        {label}
      </Text>
      <Text className="text-primary font-black text-lg leading-none">{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={{ width: 1, height: 32, backgroundColor: '#2C2C2C' }} />;
}

interface StatsByPositionProps {
  position: string;
  stats: AggregatedStats | undefined;
}

function dash(stats: AggregatedStats | undefined, v: number | undefined): string | number {
  return stats ? (v ?? 0) : '—';
}

export function StatsByPosition({ position, stats }: StatsByPositionProps) {
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
      { label: 'GC',       value: dash(stats, stats?.goalsConceded) },
    ];
  } else if (position === 'D') {
    slots = [
      { label: 'Tackles',  value: dash(stats, stats?.tackles) },
      { label: 'Intercep', value: dash(stats, stats?.interceptions) },
      { label: 'Despejes', value: dash(stats, stats?.clearances) },
      { label: 'Goles',    value: dash(stats, stats?.goals) },
    ];
  } else if (position === 'M') {
    slots = [
      { label: 'Goles', value: dash(stats, stats?.goals) },
      { label: 'Asist', value: dash(stats, stats?.assists) },
      { label: 'xG',    value: dash(stats, stats?.xG) },
      { label: 'xA',    value: dash(stats, stats?.xA) },
    ];
  } else {
    slots = [
      { label: 'Goles', value: dash(stats, stats?.goals) },
      { label: 'Asist', value: dash(stats, stats?.assists) },
      { label: 'xG',    value: dash(stats, stats?.xG) },
      { label: 'xA',    value: dash(stats, stats?.xA) },
    ];
  }

  return (
    <View className="flex-row items-center py-2">
      {slots.map((s, i) => (
        <View key={s.label} className="flex-row items-center flex-1">
          {i > 0 && <Divider />}
          <StatItem label={s.label} value={s.value} />
        </View>
      ))}
    </View>
  );
}
