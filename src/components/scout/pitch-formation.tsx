import React from 'react';
import Svg, { Rect, Circle, Text as SvgText, Line } from 'react-native-svg';
import type { SquadPlayer } from '@/lib/bzzoiro/types';

interface PitchFormationProps {
  players: SquadPlayer[];
}

type StartingPlayer = SquadPlayer & { coord: { x: number; y: number } };

const FORMATION: Record<string, Array<{ x: number; y: number }>> = {
  G: [{ x: 0.50, y: 0.88 }],
  D: [{ x: 0.18, y: 0.70 }, { x: 0.38, y: 0.70 }, { x: 0.62, y: 0.70 }, { x: 0.82, y: 0.70 }],
  M: [{ x: 0.25, y: 0.50 }, { x: 0.50, y: 0.50 }, { x: 0.75, y: 0.50 }],
  F: [{ x: 0.22, y: 0.26 }, { x: 0.50, y: 0.22 }, { x: 0.78, y: 0.26 }],
};

const LINE_PROPS = { stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 } as const;

export function PitchFormation({ players }: PitchFormationProps) {
  const grouped: Record<string, SquadPlayer[]> = { G: [], D: [], M: [], F: [] };
  for (const p of players) {
    if (p.position in grouped) grouped[p.position].push(p);
  }

  const starters: StartingPlayer[] = [];
  for (const pos of ['G', 'D', 'M', 'F'] as const) {
    const coords = FORMATION[pos];
    const group = grouped[pos];
    for (let i = 0; i < coords.length; i++) {
      if (group[i]) {
        starters.push({ ...group[i], coord: coords[i] });
      }
    }
  }

  return (
    <Svg width="100%" viewBox="0 0 300 440">
      {/* Field background */}
      <Rect x={0} y={0} width={300} height={440} fill="#0D2B0D" rx={8} />

      {/* Field border */}
      <Rect x={12} y={12} width={276} height={416} fill="none" {...LINE_PROPS} />

      {/* Halfway line */}
      <Line x1={12} y1={220} x2={288} y2={220} {...LINE_PROPS} />

      {/* Center circle */}
      <Circle cx={150} cy={220} r={36} fill="none" {...LINE_PROPS} />

      {/* Penalty area top */}
      <Rect x={78} y={12} width={144} height={72} fill="none" {...LINE_PROPS} />
      {/* Six-yard box top */}
      <Rect x={108} y={12} width={84} height={30} fill="none" {...LINE_PROPS} />

      {/* Penalty area bottom */}
      <Rect x={78} y={356} width={144} height={72} fill="none" {...LINE_PROPS} />
      {/* Six-yard box bottom */}
      <Rect x={108} y={398} width={84} height={30} fill="none" {...LINE_PROPS} />

      {/* Formation label */}
      <SvgText
        x={150}
        y={8}
        textAnchor="middle"
        fontSize={7}
        fill="rgba(255,255,255,0.4)"
      >
        Formacion estimada 4-3-3
      </SvgText>

      {/* Players */}
      {starters.map((p) => {
        const cx = p.coord.x * 300;
        const cy = p.coord.y * 440;
        const label = p.jersey_number != null ? String(p.jersey_number) : p.short_name.charAt(0);
        const nameLabel = p.short_name.slice(0, 8);
        return (
          <React.Fragment key={p.id}>
            <Circle cx={cx} cy={cy} r={14} fill="#64ffda" />
            <SvgText
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize={10}
              fontWeight="bold"
              fill="#000"
            >
              {label}
            </SvgText>
            <SvgText
              x={cx}
              y={cy + 22}
              textAnchor="middle"
              fontSize={8}
              fill="rgba(255,255,255,0.8)"
            >
              {nameLabel}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
