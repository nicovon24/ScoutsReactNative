import { Slot } from 'expo-router';
import { View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Sidebar } from './sidebar';
import { SidebarProvider } from './sidebar-context';
import { Topbar } from './topbar';

const DESKTOP_BREAKPOINT = 1024;

function ShellContent() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-mainBg">
      <View className="flex-1" style={{ flexDirection: 'row' }}>
        {/* Sidebar full-height on the far left (desktop) */}
        {isDesktop && <Sidebar />}

        {/* Right column: topbar on top + content below */}
        <View className="flex-1" style={{ minWidth: 0 }}>
          <Topbar />
          <View className="flex-1 bg-mainBg">
            <Slot />
          </View>
        </View>

        {/* Mobile drawer is absolutely positioned overlay */}
        {!isDesktop && <Sidebar />}
      </View>
    </SafeAreaView>
  );
}

export function AppShell() {
  return (
    <SidebarProvider>
      <ShellContent />
    </SidebarProvider>
  );
}
