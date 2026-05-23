import { View, Text, Pressable } from 'react-native';

export type ViewMode = 'grid' | 'table';

interface ScoutHeaderProps {
  playerCount?: number;
  seasonName?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ScoutHeader({ playerCount, seasonName, viewMode, onViewModeChange }: ScoutHeaderProps) {
  return (
    <View className="px-4 pt-4 pb-3">
      <View className="flex-row items-start justify-between">
        <View className="gap-1 flex-1">
          <Text className="text-primary text-2xl font-black tracking-tight">
            Explorar Jugadores
          </Text>
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full bg-green" />
            <Text className="text-secondary text-sm">
              {playerCount != null ? `${playerCount} jugadores` : 'Cargando...'}
              {seasonName ? ` · ${seasonName}` : ''}
            </Text>
          </View>
        </View>

        {/* View mode toggle */}
        <View
          className="flex-row rounded-lg overflow-hidden self-start mt-1"
          style={{ backgroundColor: '#161616', borderWidth: 1, borderColor: '#2C2C2C' }}
        >
          <Pressable
            onPress={() => onViewModeChange('grid')}
            style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: viewMode === 'grid' ? '#2C2C2C' : 'transparent' }}
          >
            <Text style={{ fontSize: 14, color: viewMode === 'grid' ? '#F2F2F2' : '#717171' }}>⊞</Text>
          </Pressable>
          <Pressable
            onPress={() => onViewModeChange('table')}
            style={{ paddingHorizontal: 12, paddingVertical: 8, backgroundColor: viewMode === 'table' ? '#2C2C2C' : 'transparent' }}
          >
            <Text style={{ fontSize: 14, color: viewMode === 'table' ? '#F2F2F2' : '#717171' }}>☰</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
