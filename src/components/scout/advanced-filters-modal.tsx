import React from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import { Select, type SelectOption } from '@/components/ui/select';
import type { Position } from '@/lib/bzzoiro/types';
import type { SortDir, SortKey, TeamOption } from './player-filters';
import { SORT_OPTIONS } from './player-filters';
import { PitchPositionPicker } from './pitch-position-picker';

export interface AdvancedFiltersState {
  position: Position | 'ALL';
  selectedTeam: number | null;
  sortBy: SortKey;
  sortDir: SortDir;
  minAge: string;
  maxAge: string;
}

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: AdvancedFiltersState;
  teams: TeamOption[];
  onApply: (filters: AdvancedFiltersState) => void;
}

export function AdvancedFiltersModal({ visible, onClose, filters, teams, onApply }: AdvancedFiltersModalProps) {
  const [draft, setDraft] = React.useState<AdvancedFiltersState>(filters);

  React.useEffect(() => {
    if (visible) setDraft(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const teamOptions: SelectOption<number>[] = teams.map((t) => ({
    value: t.id,
    label: t.name,
    iconUrl: `https://sports.bzzoiro.com/img/team/${t.id}/`,
  }));

  function handleSortPress(key: SortKey) {
    setDraft((d) => ({
      ...d,
      sortBy: key,
      sortDir: d.sortBy === key ? (d.sortDir === 'desc' ? 'asc' : 'desc') : 'desc',
    }));
  }

  function handleClear() {
    setDraft({ position: 'ALL', selectedTeam: null, sortBy: 'rating', sortDir: 'desc', minAge: '', maxAge: '' });
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  const posLabel =
    draft.position === 'G' ? 'Porteros' :
    draft.position === 'D' ? 'Defensores' :
    draft.position === 'M' ? 'Mediocampistas' :
    draft.position === 'F' ? 'Delanteros' : null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', alignItems: Platform.OS === 'web' ? 'center' : 'stretch' }}>
        <View style={{ backgroundColor: '#111111', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: '#2C2C2C', maxHeight: '90%', width: Platform.OS === 'web' ? '50%' : '100%' }}>

          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#1E1E1E' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#F2F2F2', fontSize: 16, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Filtros avanzados
              </Text>
              <Text style={{ color: '#717171', fontSize: 11, fontWeight: '500', marginTop: 2 }}>
                Configuracion de busqueda
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ width: 36, height: 36, borderRadius: 18, backgroundColor: pressed ? '#2C2C2C' : '#1C1C1C', borderWidth: 1, borderColor: '#3C3C3C', alignItems: 'center', justifyContent: 'center' })}
            >
              <X size={16} color="#B8B8B8" />
            </Pressable>
          </View>

          {/* Body */}
          <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>

              {/* LEFT — cancha */}
              <View style={{ width: '32%', gap: 6 }}>
                <SectionLabel label="Posicion" />
                <PitchPositionPicker
                  value={draft.position}
                  onChange={(v) => setDraft((d) => ({ ...d, position: v }))}
                />
                {posLabel !== null && (
                  <Text style={{ color: '#64ffda', fontSize: 10, fontWeight: '700', textAlign: 'center' }}>
                    {posLabel}
                  </Text>
                )}
              </View>

              {/* RIGHT — rest of filters */}
              <View style={{ flex: 1, gap: 18 }}>

                {teams.length > 0 && (
                  <View style={{ gap: 8, zIndex: 10 }}>
                    <SectionLabel label="Club actual" />
                    <Select
                      options={teamOptions}
                      value={draft.selectedTeam}
                      onChange={(v) => setDraft((d) => ({ ...d, selectedTeam: v }))}
                      placeholder="Todos los equipos"
                    />
                  </View>
                )}

                <View style={{ gap: 8 }}>
                  <SectionLabel label="Edad del jugador" />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <AgeInput placeholder="Min" value={draft.minAge} onChange={(v) => setDraft((d) => ({ ...d, minAge: v }))} />
                    <AgeInput placeholder="Max" value={draft.maxAge} onChange={(v) => setDraft((d) => ({ ...d, maxAge: v }))} />
                  </View>
                </View>

                <View style={{ gap: 8 }}>
                  <SectionLabel label="Ordenar por" />
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {SORT_OPTIONS.map((s) => {
                      const active = draft.sortBy === s.key;
                      const arrow = active ? (draft.sortDir === 'desc' ? ' ↓' : ' ↑') : '';
                      return (
                        <Pressable
                          key={s.key}
                          onPress={() => handleSortPress(s.key)}
                          style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: active ? '#64ffda' : '#2C2C2C', backgroundColor: active ? 'rgba(100,255,218,0.10)' : '#1C1C1C' }}
                        >
                          <Text style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? '#64ffda' : '#717171' }}>
                            {s.label}{arrow}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#1E1E1E' }}>
            <Pressable
              onPress={handleClear}
              style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#3C1010', backgroundColor: pressed ? '#1A0A0A' : '#140808' })}
            >
              <Trash2 size={15} color="#F04444" />
              <Text style={{ color: '#F04444', fontSize: 13, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase' }}>Limpiar</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              style={({ pressed }) => ({ flex: 2, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 14, backgroundColor: pressed ? '#26d4b3' : '#64ffda' })}
            >
              <Text style={{ color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }}>Aplicar</Text>
            </Pressable>
          </View>

        </View>
      </View>
    </Modal>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
      <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#64ffda' }} />
      <Text style={{ color: '#B8B8B8', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

function AgeInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1C', borderRadius: 10, borderWidth: 1, borderColor: '#2C2C2C', paddingHorizontal: 12, paddingVertical: 10 }}>
      <Text style={{ color: '#717171', fontSize: 9, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
        {placeholder}
      </Text>
      <TextInput
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9]/g, ''))}
        placeholder="—"
        placeholderTextColor="#3C3C3C"
        keyboardType="number-pad"
        maxLength={2}
        style={[
          { color: '#F2F2F2', fontSize: 16, fontWeight: '700' },
          Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : undefined,
        ]}
      />
    </View>
  );
}
