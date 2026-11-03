import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, radius, screen, shadow, space, touch } from '@/theme';

import { Icon, type IconName } from './Icon';
import { IconButton } from './IconButton';
import { Text } from './Text';

// 당사자 앱에는 TabBar·헤더 없음.

/* ---------- AppHeader ---------- */

type AppHeaderProps = {
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
  right?: ReactNode;
};

export function AppHeader({ title, onBack, onClose, right }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.headerSide}>
        {onBack && <IconButton icon="back" accessibilityLabel="뒤로 가기" onPress={onBack} />}
      </View>
      {title ? (
        <Text variant="bodyStrong" accessibilityRole="header" numberOfLines={1} style={styles.headerTitle}>
          {title}
        </Text>
      ) : (
        <View style={styles.headerTitle} />
      )}
      <View style={styles.headerSide}>
        {right ?? (onClose && <IconButton icon="close" accessibilityLabel="닫기" onPress={onClose} size={22} />)}
      </View>
    </View>
  );
}

/* ---------- TabBar ---------- */

export type TabKey = 'home' | 'signal' | 'location' | 'history' | 'settings';

export const tabs: readonly { key: TabKey; label: string; icon: IconName }[] = [
  { key: 'home', label: '홈', icon: 'tab-home' },
  { key: 'signal', label: '신호', icon: 'tab-signal' },
  { key: 'location', label: '위치', icon: 'tab-location' },
  { key: 'history', label: '기록', icon: 'tab-history' },
  { key: 'settings', label: '설정', icon: 'tab-settings' },
];

type TabBarProps = {
  active: TabKey;
  onSelect: (key: TabKey) => void;
};

// 높이 62 + 하단 안전영역. 현재 탭 = 노란 알약 52×30 + 800
export function TabBar({ active, onSelect }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, space[2]) }]} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onSelect(tab.key)}
            accessibilityRole="tab"
            accessibilityLabel={tab.label}
            accessibilityState={{ selected }}
            style={styles.tab}
          >
            <View style={[styles.tabIcon, selected && styles.tabIconActive]}>
              <Icon
                name={tab.icon}
                size={22}
                color={selected ? colors.textPrimary : colors.textSecondary}
                strokeWidth={selected ? 2.2 : 2}
              />
            </View>
            <Text
              style={[styles.tabLabel, selected ? styles.tabLabelActive : styles.tabLabelIdle]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ---------- StickyAction ---------- */

// TabBar 바로 위(또는 화면 하단)에 고정되는 주요 동작 영역
export function StickyAction({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.sticky, style]}>{children}</View>;
}

/* ---------- BottomSheet ---------- */

// 시트 모양만 담당. 표시/닫기는 Modal 등 상위에서 제어.
export function BottomSheet({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, space[4]) }, style]}>
      <View style={styles.handleArea}>
        <View style={styles.handle} />
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: touch.guardianMin,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerSide: {
    width: touch.guardianMin,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },

  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: space[2],
    paddingHorizontal: space[1],
  },
  tab: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[1],
  },
  tabIcon: {
    width: 52,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: { backgroundColor: colors.yellow500 },
  tabLabel: {
    fontSize: 12,
    lineHeight: 16,
  },
  tabLabelActive: { fontFamily: fontFamily.extraBold, color: colors.textPrimary },
  tabLabelIdle: { fontFamily: fontFamily.regular, color: colors.textSecondary },

  sticky: {
    backgroundColor: colors.bgIvory,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingHorizontal: screen.gutter,
    paddingVertical: space[3],
    gap: screen.buttonGap,
  },

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: screen.gutter,
    ...shadow.sheet,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: space[2],
    paddingBottom: space[3],
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.lineStrong,
  },
});
