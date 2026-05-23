import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Menu } from 'lucide-react-native';
import { Link } from 'expo-router';

import { useSidebar } from './sidebar-context';

const DESKTOP_BREAKPOINT = 1024;

function Logo() {
  return (
    <Link href="/" asChild>
      <Pressable className="flex-row items-center" style={{ gap: 10 }}>
        <View className="w-8 h-8 items-center justify-center">
          <Svg viewBox="0 0 40 40" width={32} height={32}>
            {/* Hexagon shield */}
            <Path
              d="M20 2L3 11V29L20 38L37 29V11L20 2ZM33.5 12.8V27.2L20 34.5L6.5 27.2V12.8L20 5.5L33.5 12.8Z"
              fill="#64ffda"
            />
            {/* Inner circle */}
            <Circle cx="20" cy="20" r="6" fill="#F2F2F2" />
            {/* Inner square accent */}
            <Path d="M18 18L22 18L22 22L18 22L18 18Z" fill="#64ffda" />
          </Svg>
        </View>

        <View className="flex-col">
          <Text
            className="text-primary font-black uppercase"
            style={{ fontSize: 14, lineHeight: 16, letterSpacing: 0.3 }}
          >
            ScoutPanel
          </Text>
          <Text
            className="text-green font-black uppercase"
            style={{ fontSize: 10, lineHeight: 12, letterSpacing: 2, marginTop: -1 }}
          >
            Scouting
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}

export function Topbar() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= DESKTOP_BREAKPOINT;
  const { toggleMobileMenu } = useSidebar();

  const height = isDesktop ? 80 : 64;
  const horizontalPadding = isDesktop ? 24 : 16;

  return (
    <View
      className="bg-mainBg border-b border-white/[0.04] flex-row items-center"
      style={{
        height,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
      }}
    >
      {!isDesktop && (
        <Pressable
          onPress={toggleMobileMenu}
          accessibilityLabel="Abrir menú"
          className="w-9 h-9 rounded-xl items-center justify-center"
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
            marginRight: 8,
          })}
        >
          <Menu size={20} color="#B8B8B8" />
        </Pressable>
      )}
      <Logo />
    </View>
  );
}
