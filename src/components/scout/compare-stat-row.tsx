import { View, Text } from 'react-native';
import { COMPARE_COLORS } from './compare-radar';

interface CompareStatRowProps {
  label: string;
  valueA: string | number;
  valueB: string | number;
  maxValue: number;
  /** If true, lower value wins (e.g. yellow cards) */
  lowerIsBetter?: boolean;
}

function toNum(v: string | number): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return isNaN(n) ? 0 : n;
}

export function CompareStatRow({ label, valueA, valueB, maxValue, lowerIsBetter = false }: CompareStatRowProps) {
  const nA = toNum(valueA);
  const nB = toNum(valueB);
  const showBars = maxValue > 0;
  const pctA = showBars ? Math.min(1, nA / maxValue) : 0;
  const pctB = showBars ? Math.min(1, nB / maxValue) : 0;

  const aWins = lowerIsBetter ? nA < nB : nA > nB;
  const bWins = lowerIsBetter ? nB < nA : nB > nA;
  const tied  = nA === nB;

  // Winner gets full color, loser gets a softer version of the same color
  const barA  = !tied && aWins ? COMPARE_COLORS[0] : 'rgba(100,255,218,0.4)';
  const barB  = !tied && bWins ? COMPARE_COLORS[1] : 'rgba(167,139,250,0.4)';
  const textA = !tied && aWins ? COMPARE_COLORS[0] : '#D4D4D4';
  const textB = !tied && bWins ? COMPARE_COLORS[1] : '#D4D4D4';

  const trackBg = '#2C2C2C';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E1E1E', gap: 8 }}>
      {/* Side A */}
      <View style={{ flex: 1, alignItems: 'flex-end', gap: showBars ? 6 : 0 }}>
        <Text style={{ color: textA, fontSize: 13, fontWeight: '800', textAlign: 'right' }}>{valueA}</Text>
        {showBars && (
          <View style={{ height: 5, width: '100%', backgroundColor: trackBg, borderRadius: 99, overflow: 'hidden', flexDirection: 'row', justifyContent: 'flex-end' }}>
            <View style={{ height: '100%', width: `${pctA * 100}%`, backgroundColor: barA, borderRadius: 99 }} />
          </View>
        )}
      </View>

      {/* Label */}
      <View style={{ width: 100, alignItems: 'center' }}>
        <Text style={{ color: '#717171', fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' }} numberOfLines={2}>
          {label}
        </Text>
      </View>

      {/* Side B */}
      <View style={{ flex: 1, gap: showBars ? 6 : 0 }}>
        <Text style={{ color: textB, fontSize: 13, fontWeight: '800' }}>{valueB}</Text>
        {showBars && (
          <View style={{ height: 5, width: '100%', backgroundColor: trackBg, borderRadius: 99, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${pctB * 100}%`, backgroundColor: barB, borderRadius: 99 }} />
          </View>
        )}
      </View>
    </View>
  );
}

// ── Section title ─────────────────────────────────────────────────────────────

export function CompareSectionTitle({ title, accent }: { title: string; accent: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 2 }}>
      <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
      <Text style={{ color: accent, fontSize: 9, fontWeight: '900', letterSpacing: 2.5, textTransform: 'uppercase' }}>
        {title}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: '#222' }} />
    </View>
  );
}
