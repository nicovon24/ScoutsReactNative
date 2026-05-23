import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BarChart2, X } from 'lucide-react-native';
import { useCompareStore } from '@/store/compare-store';

const C = {
  surface: '#1C1C1C',
  border:  '#2C2C2C',
  primary: '#F2F2F2',
  muted:   '#717171',
  green:   '#64ffda',
  danger:  '#F04444',
};

export function CompareBar() {
  const { slots, removeFromCompare, clearCompare } = useCompareStore();
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: slots.length > 0 ? 0 : 100,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [slots.length, slideAnim]);

  if (slots.length === 0) return null;

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        transform: [{ translateY: slideAnim }],
        zIndex: 999,
        pointerEvents: 'box-none',
      } as object}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          backgroundColor: C.surface,
          borderWidth: 1,
          borderColor: C.border,
          borderRadius: 16,
          paddingHorizontal: 16,
          paddingVertical: 12,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 8 },
        }}
      >
        {/* Player slots */}
        {slots.map((p, i) => {
          const photoUrl = `https://sports.bzzoiro.com/img/player/${p.id}/`;
          const color = i === 0 ? '#64ffda' : '#a78bfa';
          return (
            <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {i > 0 && (
                <Text style={{ color: C.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1 }}>VS</Text>
              )}
              <View style={{ position: 'relative' }}>
                <View style={{ width: 34, height: 34, borderRadius: 99, borderWidth: 2, borderColor: color, overflow: 'hidden', backgroundColor: '#2C2C2C' }}>
                  <Image source={{ uri: photoUrl }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </View>
              </View>
              <Text style={{ color: C.primary, fontSize: 13, fontWeight: '700', maxWidth: 90 }} numberOfLines={1}>
                {p.name.split(' ')[0]}
              </Text>
              <Pressable
                onPress={() => removeFromCompare(p.id)}
                style={({ pressed }) => ({
                  width: 22, height: 22, borderRadius: 99,
                  backgroundColor: pressed ? 'rgba(240,68,68,0.15)' : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                })}
              >
                <X size={12} color={C.muted} />
              </Pressable>
            </View>
          );
        })}

        {/* Hint when only 1 */}
        {slots.length === 1 && (
          <Text style={{ color: C.muted, fontSize: 11, fontWeight: '600' }}>+ 1 jugador más</Text>
        )}

        {/* Compare button */}
        {slots.length === 2 && (
          <Pressable
            onPress={() => router.push(`/compare?ids=${slots.map((p) => p.id).join(',')}`)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 6,
              backgroundColor: pressed ? '#4dd9b8' : C.green,
              borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8,
            })}
          >
            <BarChart2 size={14} color="#000" />
            <Text style={{ color: '#000', fontSize: 12, fontWeight: '900' }}>Comparar</Text>
          </Pressable>
        )}

        {/* Clear all */}
        <Pressable
          onPress={clearCompare}
          style={({ pressed }) => ({
            width: 28, height: 28, borderRadius: 99,
            backgroundColor: pressed ? 'rgba(240,68,68,0.12)' : 'rgba(255,255,255,0.04)',
            alignItems: 'center', justifyContent: 'center',
          })}
        >
          <X size={14} color={C.muted} />
        </Pressable>
      </View>
    </Animated.View>
  );
}
