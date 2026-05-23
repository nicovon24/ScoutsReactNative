import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Link, usePathname } from 'expo-router';
import {
  BarChart2,
  ChevronLeft,
  Home,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react-native';

import { useSidebar } from './sidebar-context';

const DESKTOP_BREAKPOINT = 1024;

type NavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

const NAV_ITEMS: NavItem[] = [
  { href: '/', icon: Home, label: 'Jugadores' },
  { href: '/compare', icon: BarChart2, label: 'Comparar' },
];

const COLOR_GREEN = '#64ffda';
const COLOR_PRIMARY = '#F2F2F2';
const COLOR_SECONDARY = '#B8B8B8';
const COLOR_MUTED = '#717171';
const COLOR_DANGER = '#F04444';

type NavLinkProps = {
  item: NavItem;
  active: boolean;
  expanded: boolean;
  showLabel: boolean;
  onPress?: () => void;
};

function NavLink({ item, active, expanded, showLabel, onPress }: NavLinkProps) {
  const Icon = item.icon;
  const iconColor = active ? COLOR_GREEN : COLOR_MUTED;
  const labelColor = active ? COLOR_PRIMARY : COLOR_SECONDARY;

  return (
    <Link href={item.href as never} asChild>
      <Pressable
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={item.label}
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
          alignSelf: 'stretch',
          height: 60,
          borderRadius: 14,
          backgroundColor: hovered
            ? 'rgba(255,255,255,0.03)'
            : pressed
              ? 'rgba(255,255,255,0.05)'
              : 'transparent',
        })}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: showLabel ? 'flex-start' : 'center',
            paddingHorizontal: 12,
            gap: 14,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? '#0A0A0A' : 'transparent',
              borderWidth: active ? 1 : 0,
              borderColor: active ? 'rgba(100,255,218,0.45)' : 'transparent',
            }}
          >
            <Icon size={22} color={iconColor} strokeWidth={active ? 2.5 : 2} />
          </View>
          {showLabel && (
            <Text
              numberOfLines={1}
              style={{
                color: labelColor,
                fontWeight: '700',
                fontSize: 15,
                flexShrink: 1,
              }}
            >
              {item.label}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

type SidebarBodyProps = {
  isDesktop: boolean;
  expanded: boolean;
  showLabel: boolean;
  pathname: string;
  onItemPress?: () => void;
  onClose?: () => void;
  onToggleExpanded?: () => void;
};

function SidebarBody({
  isDesktop,
  expanded,
  showLabel,
  pathname,
  onItemPress,
  onClose,
  onToggleExpanded,
}: SidebarBodyProps) {
  return (
    <View
      style={{
        flex: 1,
        paddingVertical: 24,
        paddingHorizontal: showLabel ? 16 : 12,
      }}
    >
      {/* Mobile header (close button) */}
      {!isDesktop && (
        <View style={{ marginBottom: 20, gap: 12 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '900',
                letterSpacing: 2,
                color: 'rgba(113,113,113,0.5)',
                textTransform: 'uppercase',
              }}
            >
              Menú
            </Text>
            <Pressable
              onPress={onClose}
              accessibilityLabel="Cerrar menú"
              style={({ pressed }) => ({
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
              })}
            >
              <X size={18} color={COLOR_SECONDARY} />
            </Pressable>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        </View>
      )}

      {/* Desktop expand/collapse toggle */}
      {isDesktop && (
        <Pressable
          onPress={onToggleExpanded}
          accessibilityLabel={expanded ? 'Contraer barra lateral' : 'Expandir barra lateral'}
          style={({ pressed }) => ({
            width: 44,
            height: 44,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
            alignSelf: expanded ? 'flex-end' : 'center',
            backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
          })}
        >
          {expanded ? (
            <ChevronLeft size={22} color={COLOR_SECONDARY} />
          ) : (
            <Menu size={22} color={COLOR_SECONDARY} />
          )}
        </Pressable>
      )}

      {/* Nav */}
      <View style={{ flex: 1, gap: isDesktop ? 14 : 60 }}>
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <NavLink
              key={item.href}
              item={item}
              active={active}
              expanded={expanded}
              showLabel={showLabel}
              onPress={onItemPress}
            />
          );
        })}
      </View>

      {/* Logout (visual only — no auth in this project yet) */}
      <Pressable
        accessibilityLabel="Cerrar sesión"
        style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => ({
          alignSelf: 'stretch',
          height: 60,
          borderRadius: 14,
          backgroundColor: hovered
            ? 'rgba(240,68,68,0.10)'
            : pressed
              ? 'rgba(240,68,68,0.15)'
              : 'transparent',
        })}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: showLabel ? 'flex-start' : 'center',
            paddingHorizontal: 18,
            gap: 18,
          }}
        >
          <LogOut size={22} color={COLOR_MUTED} />
          {showLabel && (
            <Text style={{ color: COLOR_MUTED, fontWeight: '700', fontSize: 15 }}>
              Cerrar Sesión
            </Text>
          )}
        </View>
      </Pressable>
    </View>
  );
}

export function Sidebar() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const pathname = usePathname();
  const {
    sidebarExpanded,
    toggleSidebar,
    mobileMenuOpen,
    setMobileMenuOpen,
  } = useSidebar();

  // Slide-in animation for mobile drawer
  const drawerWidth = 256;
  const translateX = useRef(new Animated.Value(-drawerWidth)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: mobileMenuOpen ? 0 : -drawerWidth,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(backdropOpacity, {
        toValue: mobileMenuOpen ? 1 : 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start();
  }, [mobileMenuOpen, translateX, backdropOpacity]);

  if (isDesktop) {
    // Fixed sidebar on desktop
    const desktopWidth = sidebarExpanded ? 256 : 80;
    return (
      <View
        style={{
          width: desktopWidth,
          backgroundColor: '#0A0A0A',
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.05)',
          transitionProperty: 'width',
          transitionDuration: '300ms',
        }}
      >
        <SidebarBody
          isDesktop
          expanded={sidebarExpanded}
          showLabel={sidebarExpanded}
          pathname={pathname}
          onToggleExpanded={toggleSidebar}
        />
      </View>
    );
  }

  // Mobile: drawer overlay
  return (
    <>
      {/* Backdrop */}
      <Animated.View
        pointerEvents={mobileMenuOpen ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          opacity: backdropOpacity,
          zIndex: 75,
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setMobileMenuOpen(false)}
          accessibilityLabel="Cerrar menú"
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: drawerWidth,
          backgroundColor: '#0A0A0A',
          borderRightWidth: 1,
          borderRightColor: 'rgba(255,255,255,0.05)',
          zIndex: 80,
          transform: [{ translateX }],
        }}
      >
        <SidebarBody
          isDesktop={false}
          expanded
          showLabel
          pathname={pathname}
          onClose={() => setMobileMenuOpen(false)}
          onItemPress={() => setMobileMenuOpen(false)}
        />
      </Animated.View>
    </>
  );
}
