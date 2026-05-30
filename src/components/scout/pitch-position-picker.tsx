import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Position } from '@/lib/bzzoiro/types';

interface PitchPositionPickerProps {
  value: Position | 'ALL';
  onChange: (v: Position | 'ALL') => void;
}

// top/left as percentage of pitch container (0–100)
const NODES: Array<{ label: string; group: Position; top: number; left: number }> = [
  { label: 'GK',  group: 'G', top:  7, left: 50 },
  { label: 'LB',  group: 'D', top: 25, left: 15 },
  { label: 'CB',  group: 'D', top: 25, left: 50 },
  { label: 'RB',  group: 'D', top: 25, left: 85 },
  { label: 'CDM', group: 'M', top: 42, left: 50 },
  { label: 'CM',  group: 'M', top: 56, left: 22 },
  { label: 'CAM', group: 'M', top: 56, left: 78 },
  { label: 'LW',  group: 'F', top: 71, left: 15 },
  { label: 'SS',  group: 'F', top: 71, left: 50 },
  { label: 'RW',  group: 'F', top: 71, left: 85 },
  { label: 'ST',  group: 'F', top: 84, left: 50 },
];

const NODE_SIZE = 34;

export function PitchPositionPicker({ value, onChange }: PitchPositionPickerProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  function handlePress(group: Position) {
    onChange(value === group ? 'ALL' : group);
  }

  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ w: width, h: height });
      }}
      style={{
        width: '100%',
        aspectRatio: 0.62,
        backgroundColor: '#0A2416',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      {size.w > 0 && (
        <>
          <PitchLines />

          {NODES.map((node) => {
            const active = value === node.group;
            const top = (node.top / 100) * size.h - NODE_SIZE / 2;
            const left = (node.left / 100) * size.w - NODE_SIZE / 2;

            return (
              <Pressable
                key={node.label}
                onPress={() => handlePress(node.group)}
                style={({ pressed }) => ({
                  position: 'absolute',
                  top,
                  left,
                  width: NODE_SIZE,
                  height: NODE_SIZE,
                  borderRadius: NODE_SIZE / 2,
                  backgroundColor: active
                    ? '#64ffda'
                    : pressed
                    ? 'rgba(100,255,218,0.25)'
                    : 'rgba(0,0,0,0.6)',
                  borderWidth: active ? 0 : 1.5,
                  borderColor: 'rgba(255,255,255,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                })}
              >
                <Text
                  style={{
                    fontSize: 8,
                    fontWeight: '900',
                    color: active ? '#000' : '#fff',
                    letterSpacing: 0.3,
                  }}
                >
                  {node.label}
                </Text>
              </Pressable>
            );
          })}
        </>
      )}
    </View>
  );
}

function PitchLines() {
  const C = 'rgba(255,255,255,0.15)';
  const W = 1;

  return (
    <>
      {/* Outer boundary */}
      <View style={{ position: 'absolute', inset: 8, borderWidth: W, borderColor: C, borderRadius: 4 }} pointerEvents="none" />

      {/* Halfway line */}
      <View style={{ position: 'absolute', top: '50%', left: 8, right: 8, height: W, backgroundColor: C }} pointerEvents="none" />

      {/* Centre circle */}
      <View
        style={{
          position: 'absolute', top: '50%', left: '50%',
          marginTop: -20, marginLeft: -20,
          width: 40, height: 40, borderRadius: 20,
          borderWidth: W, borderColor: C,
        }}
        pointerEvents="none"
      />

      {/* Top penalty area */}
      <View style={{ position: 'absolute', top: 8, left: '22%', right: '22%', height: '20%', borderWidth: W, borderColor: C, borderTopWidth: 0 }} pointerEvents="none" />

      {/* Bottom penalty area */}
      <View style={{ position: 'absolute', bottom: 8, left: '22%', right: '22%', height: '20%', borderWidth: W, borderColor: C, borderBottomWidth: 0 }} pointerEvents="none" />

      {/* Top goal */}
      <View style={{ position: 'absolute', top: 8, left: '36%', right: '36%', height: '6%', borderWidth: W, borderColor: C, borderTopWidth: 0 }} pointerEvents="none" />

      {/* Bottom goal */}
      <View style={{ position: 'absolute', bottom: 8, left: '36%', right: '36%', height: '6%', borderWidth: W, borderColor: C, borderBottomWidth: 0 }} pointerEvents="none" />
    </>
  );
}
