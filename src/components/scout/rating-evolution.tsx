import { View, Text, useWindowDimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import type { RatingPoint } from '@/lib/player-detail';

interface RatingEvolutionProps {
  data: RatingPoint[];
}

function barColor(rating: number): string {
  if (rating >= 7.5) return '#64ffda';
  if (rating >= 7.0) return '#E8A838';
  return '#717171';
}

export function RatingEvolution({ data }: RatingEvolutionProps) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.min(screenWidth - 64, 520);
  const chartHeight = 120;
  const paddingX = 4;
  const paddingTop = 12;
  const paddingBottom = 24;
  const innerH = chartHeight - paddingTop - paddingBottom;

  if (data.length === 0) {
    return (
      <View style={{ alignItems: 'center', justifyContent: 'center', height: chartHeight }}>
        <Text style={{ color: '#717171', fontSize: 12 }}>Sin datos de evolución</Text>
      </View>
    );
  }

  const barW = Math.max(6, (chartWidth - paddingX * 2) / data.length - 3);
  const gap = (chartWidth - paddingX * 2 - barW * data.length) / Math.max(1, data.length - 1);
  const minR = 5;
  const maxR = 10;
  const range = maxR - minR;

  return (
    <View>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Reference line at 7.0 */}
        {[6, 7, 8].map((ref) => {
          const y = paddingTop + innerH - ((ref - minR) / range) * innerH;
          return (
            <Line
              key={ref}
              x1={paddingX} y1={y}
              x2={chartWidth - paddingX} y2={y}
              stroke="#2C2C2C"
              strokeWidth={1}
              strokeDasharray={ref === 7 ? '4 3' : undefined}
            />
          );
        })}

        {/* Bars */}
        {data.map((p, i) => {
          const x = paddingX + i * (barW + gap);
          const barH = Math.max(2, ((p.rating - minR) / range) * innerH);
          const y = paddingTop + innerH - barH;
          const color = barColor(p.rating);
          return (
            <Rect
              key={p.index}
              x={x} y={y}
              width={barW} height={barH}
              fill={color}
              rx={2}
              opacity={0.88}
            />
          );
        })}

        {/* Y labels */}
        {[6, 7, 8].map((ref) => {
          const y = paddingTop + innerH - ((ref - minR) / range) * innerH;
          return (
            <SvgText key={ref} x={paddingX} y={y - 3} fontSize={8} fill="#717171">
              {ref}
            </SvgText>
          );
        })}

        {/* X label: last match */}
        <SvgText
          x={chartWidth - paddingX}
          y={chartHeight - 4}
          fontSize={8}
          fill="#717171"
          textAnchor="end"
        >
          último partido →
        </SvgText>
      </Svg>
    </View>
  );
}
