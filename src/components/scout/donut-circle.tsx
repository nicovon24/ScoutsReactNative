import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface DonutCircleProps {
  value: number;       // 0-100
  label: string;
  color?: string;
  size?: number;
}

export function DonutCircle({ value, label, color = '#64ffda', size = 84 }: DonutCircleProps) {
  const strokeWidth = 6;
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={{ alignItems: 'center', gap: 8 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          {/* Track */}
          <Circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="#2C2C2C"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <Circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </Svg>
        {/* Center value */}
        <View style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#F2F2F2', fontSize: 14, fontWeight: '800', lineHeight: 16 }}>
            {pct.toFixed(0)}%
          </Text>
        </View>
      </View>
      <Text
        numberOfLines={2}
        style={{
          color: '#B8B8B8',
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: 1.2,
          textAlign: 'center',
          maxWidth: size,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
