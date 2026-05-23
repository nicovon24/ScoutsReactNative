import { View, Text } from 'react-native';

const POSITION_CFG: Record<string, { bg: string; fg: string; label: string }> = {
  G:  { bg: '#E8A838', fg: '#1A1100', label: 'GK'  },
  D:  { bg: '#0C65D4', fg: '#fff',    label: 'DEF' },
  M:  { bg: '#00E094', fg: '#003322',  label: 'MID' },
  F:  { bg: '#F04444', fg: '#fff',    label: 'CF'  },
  '': { bg: '#2C2C2C', fg: '#B8B8B8', label: '—'   },
};

interface PositionBadgeProps {
  position: string;
  /** 'sm' = compact (10px), 'md' = normal (12px) */
  size?: 'sm' | 'md';
}

export function PositionBadge({ position, size = 'md' }: PositionBadgeProps) {
  const cfg = POSITION_CFG[position] ?? POSITION_CFG[''];
  const fontSize = size === 'sm' ? 10 : 12;
  const px       = size === 'sm' ? 7  : 10;
  const py       = size === 'sm' ? 3  : 4;

  return (
    <View style={{ backgroundColor: cfg.bg, borderRadius: 999, paddingHorizontal: px, paddingVertical: py }}>
      <Text style={{ color: cfg.fg, fontSize, fontWeight: '800', letterSpacing: 0.5 }}>
        {cfg.label}
      </Text>
    </View>
  );
}
