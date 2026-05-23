import { useEffect } from 'react';
import { Platform } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppShell } from '@/components/layout';
import { queryClient, restoreCache, setupCachePersistence } from '@/lib/query-client';

restoreCache();

export default function TabLayout() {
  useEffect(() => {
    setupCachePersistence();
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.title = 'ScoutPanel';
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DarkTheme}>
        <AnimatedSplashOverlay />
        <AppShell />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
