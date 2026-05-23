import { View, Text } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { RadarPoint } from '@/lib/player-detail';

export const COMPARE_COLORS = ['#64ffda', '#a78bfa'] as const;

interface CompareRadarProps {
  pointsA: RadarPoint[];
  pointsB: RadarPoint[];
  nameA: string;
  nameB: string;
  size?: number;
}

export function CompareRadar({ pointsA, pointsB, nameA, nameB, size = 220 }: CompareRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const numAxes = pointsA.length;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  function axisPoint(idx: number, scale: number) {
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    };
  }

  const ptsA = pointsA.map((p, i) => axisPoint(i, p.value));
  const ptsB = pointsB.map((p, i) => axisPoint(i, p.value));
  const polyA = ptsA.map((p) => `${p.x},${p.y}`).join(' ');
  const polyB = ptsB.map((p) => `${p.x},${p.y}`).join(' ');

  // Use pointsA labels (same axes for both)
  const labels = pointsA.map((p) => p.label);

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      <Svg width={size} height={size}>
        {/* Grid */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: numAxes }, (_, i) => axisPoint(i, level));
          return (
            <Polygon
              key={level}
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={level === 1 ? '#3C3C3C' : '#232323'}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {Array.from({ length: numAxes }, (_, i) => {
          const tip = axisPoint(i, 1);
          return <Line key={i} x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#232323" strokeWidth={1} />;
        })}

        {/* Player B polygon (behind) */}
        <Polygon points={polyB} fill="rgba(167,139,250,0.12)" stroke={COMPARE_COLORS[1]} strokeWidth={2} />

        {/* Player A polygon (front) */}
        <Polygon points={polyA} fill="rgba(100,255,218,0.12)" stroke={COMPARE_COLORS[0]} strokeWidth={2} />

        {/* Dots A */}
        {ptsA.map((p, i) => <Circle key={`a${i}`} cx={p.x} cy={p.y} r={3.5} fill={COMPARE_COLORS[0]} />)}

        {/* Dots B */}
        {ptsB.map((p, i) => <Circle key={`b${i}`} cx={p.x} cy={p.y} r={3} fill={COMPARE_COLORS[1]} />)}

        {/* Labels */}
        {labels.map((label, i) => {
          const lp = axisPoint(i, 1.3);
          return (
            <SvgText key={i} x={lp.x} y={lp.y} fontSize={9} fill="#717171" textAnchor="middle" alignmentBaseline="middle" fontWeight="700">
              {label}
            </SvgText>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={{ flexDirection: 'row', gap: 20 }}>
        {[{ name: nameA, color: COMPARE_COLORS[0] }, { name: nameB, color: COMPARE_COLORS[1] }].map((item) => (
          <View key={item.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: item.color }} />
            <Text style={{ color: '#B8B8B8', fontSize: 11, fontWeight: '700' }} numberOfLines={1}>{item.name.split(' ')[0]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
