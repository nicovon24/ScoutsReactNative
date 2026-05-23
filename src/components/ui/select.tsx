import { useState, useRef, useEffect, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView, Platform } from 'react-native';
import { Image } from 'expo-image';

export interface SelectOption<V extends string | number> {
  value: V;
  label: string;
  iconUrl?: string;
  icon?: ReactNode;
}

interface SelectProps<V extends string | number> {
  options: SelectOption<V>[];
  value: V | null;
  onChange: (v: V | null) => void;
  placeholder?: string;
  allowClear?: boolean;
  width?: number | string;
  maxHeight?: number;
  triggerHeight?: number;
}

// ─── Web portal dropdown (escapes any parent overflow / z-index) ──────────────

function WebPortalDropdown({
  anchorEl,
  onClose,
  children,
  maxHeight,
}: {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  children: (effectiveMaxHeight: number) => ReactNode;
  maxHeight: number;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [viewportH, setViewportH] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0,
  );

  useEffect(() => {
    if (!anchorEl) return;
    const update = () => {
      setRect(anchorEl.getBoundingClientRect());
      setViewportH(window.innerHeight);
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [anchorEl]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const node = anchorEl;
      const dropdown = document.getElementById('select-portal-dropdown');
      if (node && !node.contains(e.target as Node) && dropdown && !dropdown.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [anchorEl, onClose]);

  if (!rect) return null;

  const SAFE_MARGIN = 12;
  const spaceBelow = viewportH - rect.bottom - SAFE_MARGIN;
  const spaceAbove = rect.top - SAFE_MARGIN;
  // Open upwards only when there's clearly more room above
  const openUp = spaceAbove > spaceBelow && spaceAbove > 160;
  const available = Math.max(160, openUp ? spaceAbove : spaceBelow);
  const effectiveMaxHeight = Math.min(maxHeight, available);

  const top = openUp ? rect.top + window.scrollY - 4 : rect.bottom + window.scrollY + 4;

  const { createPortal } = require('react-dom');
  return createPortal(
    <div
      id="select-portal-dropdown"
      style={{
        position: 'absolute',
        top,
        left: rect.left + window.scrollX,
        width: rect.width,
        zIndex: 99999,
        transform: openUp ? 'translateY(-100%)' : undefined,
      }}
    >
      {children(effectiveMaxHeight)}
    </div>,
    document.body,
  );
}

// ─── Native dropdown (rendered inline, z-index + elevation) ──────────────────

function NativeDropdown({ maxHeight, children }: { maxHeight: number; children: ReactNode }) {
  return (
    <View
      style={{
        position: 'absolute',
        top: 42,
        left: 0,
        right: 0,
        zIndex: 9999,
        elevation: 20,
      }}
    >
      <View
        style={{
          backgroundColor: '#111111',
          borderWidth: 1,
          borderColor: '#2C2C2C',
          borderRadius: 12,
          paddingVertical: 6,
          maxHeight,
        }}
      >
        {children}
      </View>
    </View>
  );
}

// ─── Main Select ──────────────────────────────────────────────────────────────

export function Select<V extends string | number>({
  options,
  value,
  onChange,
  placeholder = 'Todos',
  allowClear = true,
  width = '100%',
  maxHeight = 320,
  triggerHeight,
}: SelectProps<V>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<View>(null);
  const [nativeEl, setNativeEl] = useState<HTMLElement | null>(null);

  // On web, grab the underlying DOM node from the ref
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = containerRef.current as unknown as HTMLElement | null;
    if (node) setNativeEl(node);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  const renderDropdownContent = (effectiveMaxHeight: number) => (
    <ScrollView
      style={{ maxHeight: effectiveMaxHeight - 12 }}
      showsVerticalScrollIndicator
      nestedScrollEnabled
      keyboardShouldPersistTaps="handled"
    >
      {allowClear && (
        <>
          <SelectRow
            active={value === null}
            label={placeholder}
            icon={
              <View
                style={{
                  width: 22, height: 22, borderRadius: 11,
                  borderWidth: 1.5,
                  borderColor: value === null ? '#64ffda' : '#2C2C2C',
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: value === null ? 'rgba(100,255,218,0.10)' : 'transparent',
                }}
              >
                <Text style={{ color: value === null ? '#64ffda' : '#717171', fontSize: 8, fontWeight: '800' }}>
                  ALL
                </Text>
              </View>
            }
            onPress={() => { onChange(null); setOpen(false); }}
          />
          <View style={{ height: 1, backgroundColor: '#2C2C2C', marginVertical: 2 }} />
        </>
      )}

      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <SelectRow
            key={String(opt.value)}
            active={active}
            label={opt.label}
            icon={
              opt.icon ?? (
                opt.iconUrl ? (
                  <Image source={{ uri: opt.iconUrl }} style={{ width: 22, height: 22 }} contentFit="contain" />
                ) : null
              )
            }
            onPress={() => { onChange(active && allowClear ? null : opt.value); setOpen(false); }}
          />
        );
      })}
    </ScrollView>
  );

  return (
    <View ref={containerRef} style={{ width: width as number, position: 'relative' }}>
      {/* Trigger button */}
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: '#1C1C1C',
          borderWidth: 1,
          borderColor: open ? '#64ffda' : '#2C2C2C',
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: triggerHeight ? 0 : 6,
          height: triggerHeight,
          gap: 6,
        }}
      >
        {selected ? (
          <>
            {selected.icon ?? (
              selected.iconUrl
                ? <Image source={{ uri: selected.iconUrl }} style={{ width: 16, height: 16 }} contentFit="contain" />
                : null
            )}
            <Text style={{ color: '#F2F2F2', fontSize: 11, fontWeight: '600', flex: 1 }} numberOfLines={1}>
              {selected.label}
            </Text>
          </>
        ) : (
          <Text style={{ color: '#717171', fontSize: 11, fontWeight: '500', flex: 1 }}>{placeholder}</Text>
        )}
        <Text style={{ color: '#717171', fontSize: 10 }}>{open ? '▴' : '▾'}</Text>
      </Pressable>

      {/* Dropdown */}
      {open && (
        Platform.OS === 'web'
          ? (
            <WebPortalDropdown
              anchorEl={nativeEl}
              onClose={() => setOpen(false)}
              maxHeight={maxHeight}
            >
              {(effectiveMaxHeight) => (
                <div style={{
                  backgroundColor: '#111111',
                  border: '1px solid #2C2C2C',
                  borderRadius: 12,
                  paddingTop: 6, paddingBottom: 6,
                  maxHeight: effectiveMaxHeight,
                  overflow: 'hidden',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                  WebkitOverflowScrolling: 'touch',
                }}>
                  {renderDropdownContent(effectiveMaxHeight)}
                </div>
              )}
            </WebPortalDropdown>
          )
          : (
            <NativeDropdown maxHeight={maxHeight}>
              {renderDropdownContent(maxHeight)}
            </NativeDropdown>
          )
      )}
    </View>
  );
}

// ─── Row item ─────────────────────────────────────────────────────────────────

function SelectRow({
  active, label, icon, onPress,
}: {
  active: boolean;
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      onPress={onPress}
      // @ts-expect-error web-only hover events
      onMouseEnter={Platform.OS === 'web' ? () => setHovered(true) : undefined}
      onMouseLeave={Platform.OS === 'web' ? () => setHovered(false) : undefined}
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 8, gap: 10,
        backgroundColor: active ? 'rgba(100,255,218,0.10)' : hovered ? '#1C1C1C' : 'transparent',
      }}
    >
      {icon}
      <Text
        style={{ color: active ? '#64ffda' : '#B8B8B8', fontSize: 12, fontWeight: active ? '700' : '500', flex: 1 }}
        numberOfLines={1}
      >
        {label}
      </Text>
      {active && <Text style={{ color: '#64ffda', fontSize: 10 }}>✓</Text>}
    </Pressable>
  );
}
