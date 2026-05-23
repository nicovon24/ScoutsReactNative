import { View } from 'react-native';
import Svg, { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import type { RadarPoint } from '@/lib/player-detail';

interface SkillRadarProps {
  points: RadarPoint[];
  size?: number;
}

export function SkillRadar({ points, size = 200 }: SkillRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;
  const numAxes = points.length;
  const gridLevels = [0.25, 0.5, 0.75, 1];

  function axisPoint(idx: number, scale: number) {
    const angle = (Math.PI * 2 * idx) / numAxes - Math.PI / 2;
    return {
      x: cx + r * scale * Math.cos(angle),
      y: cy + r * scale * Math.sin(angle),
    };
  }

  const dataPoints = points.map((p, i) => axisPoint(i, p.value));
  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Grid polygons */}
        {gridLevels.map((level) => {
          const pts = Array.from({ length: numAxes }, (_, i) => axisPoint(i, level));
          return (
            <Polygon
              key={level}
              points={pts.map((p) => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={level === 1 ? '#3C3C3C' : '#2C2C2C'}
              strokeWidth={1}
            />
          );
        })}

        {/* Axis lines */}
        {Array.from({ length: numAxes }, (_, i) => {
          const tip = axisPoint(i, 1);
          return (
            <Line key={i} x1={cx} y1={cy} x2={tip.x} y2={tip.y} stroke="#2C2C2C" strokeWidth={1} />
          );
        })}

        {/* Data area */}
        <Polygon
          points={dataPolygon}
          fill="rgba(100,255,218,0.12)"
          stroke="#64ffda"
          strokeWidth={2}
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#64ffda" />
        ))}

        {/* Labels */}
        {points.map((p, i) => {
          const lp = axisPoint(i, 1.28);
          return (
            <SvgText
              key={i}
              x={lp.x}
              y={lp.y}
              fontSize={9}
              fill="#717171"
              textAnchor="middle"
              alignmentBaseline="middle"
              fontWeight="700"
            >
              {p.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}
