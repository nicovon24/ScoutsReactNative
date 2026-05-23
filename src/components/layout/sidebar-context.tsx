import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

type SidebarContextValue = {
  sidebarExpanded: boolean;
  setSidebarExpanded: (v: boolean) => void;
  toggleSidebar: () => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (v: boolean) => void;
  toggleMobileMenu: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarExpanded((v) => !v), []);
  const toggleMobileMenu = useCallback(() => setMobileMenuOpen((v) => !v), []);

  const value = useMemo<SidebarContextValue>(
    () => ({
      sidebarExpanded,
      setSidebarExpanded,
      toggleSidebar,
      mobileMenuOpen,
      setMobileMenuOpen,
      toggleMobileMenu,
    }),
    [sidebarExpanded, mobileMenuOpen, toggleSidebar, toggleMobileMenu],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return ctx;
}
