import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, screen, space, touch, type SpaceToken } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

/* ---------- Screen ---------- */

type ScreenProps = {
  children: ReactNode;
  /** 화면 위 고정 (뒤로 가기 헤더 등) */
  header?: ReactNode;
  /** 화면 아래 고정 (주요 버튼). 본문과 사이는 비워 둔다 */
  footer?: ReactNode;
  /** 입력 화면·긴 화면: 스크롤 + 키보드 회피 */
  scroll?: boolean;
  /** dark: 어두운 화면 (QR 인식 등) */
  tone?: 'light' | 'dark';
  /** 본문 자식 사이 간격 (space 토큰). margin 대신 이 값으로 띄운다 */
  gap?: SpaceToken;
  /** 본문 맨 위 여백 (space 토큰). 헤더 없는 화면의 첫 요소 위치 */
  paddingTop?: SpaceToken;
  /**
   * 헤더 없는 화면에서 ScreenHeader 높이(md 48 · lg 56)만큼 위를 비운다.
   * paddingTop은 그 아래에 더해진다. 헤더 있는 화면과 첫 요소 위치를 맞출 때.
   */
  reserveHeader?: 'md' | 'lg';
  /** 좌우 여백: default 20 (보호자) · tab 16 (홈·탭 화면) · recipient 24 (당사자) */
  gutter?: 'default' | 'tab' | 'recipient';
  /** 탭 화면: 하단 안전영역은 탭바가 맡으므로 하단 여백을 줄인다 */
  inTabs?: boolean;
  /** 본문 정렬 */
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  contentStyle?: StyleProp<ViewStyle>;
};

// 모든 화면의 기본 틀. 좌우 여백 20(탭 16 · 당사자 24), 하단 여백 = 안전영역 + 24.
export function Screen({
  children,
  header,
  footer,
  scroll,
  tone = 'light',
  gap = 0,
  paddingTop = 0,
  reserveHeader,
  gutter = 'default',
  inTabs,
  align,
  justify,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const background = tone === 'dark' ? colors.ink900 : colors.bgIvory;
  const gutterX = gutter === 'tab' ? screen.gutterTab : gutter === 'recipient' ? screen.gutterRecipient : screen.gutter;
  const bodyLayout: ViewStyle = {
    gap: space[gap],
    paddingTop: space[paddingTop] + (reserveHeader ? headerHeight[reserveHeader] : 0),
    alignItems: align,
    justifyContent: justify,
  };

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, bodyLayout, inTabs && styles.scrollTabsBottom, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, bodyLayout, contentStyle]}>{children}</View>
  );

  const bottom = inTabs ? (footer ? space[3] : 0) : Math.max(insets.bottom, space[4]) + space[6];

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: bottom, paddingHorizontal: gutterX }]}>
        {header}
        {body}
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- ScreenHeader ---------- */

// 헤더 높이 = 아이콘 버튼 터치 영역 (보호자 48 · 당사자 56)
const headerHeight = { md: touch.guardianMin, lg: 56 } as const;
const headerIcon = { md: 26, lg: 30 } as const;

type ScreenHeaderProps = {
  title?: string;
  onBack?: () => void;
  onClose?: () => void;
  /** md: 보호자 48 · lg: 당사자 56 */
  size?: 'md' | 'lg';
  tone?: 'light' | 'dark';
};

// 왼쪽 뒤로/닫기 + 왼쪽 정렬 제목
export function ScreenHeader({ title, onBack, onClose, size = 'md', tone = 'light' }: ScreenHeaderProps) {
  const isLg = size === 'lg';
  const color = tone === 'dark' ? colors.textOnDark : colors.textPrimary;
  const onPress = onBack ?? onClose;
  const height = headerHeight[size];

  return (
    // 아이콘 글리프가 화면 좌우 여백선에 오도록 터치 영역의 빈 부분만큼 왼쪽으로 당긴다
    <View style={[styles.header, { height, marginLeft: -(height - headerIcon[size]) / 2 }]}>
      {onPress && (
        <IconButton
          icon={onBack ? 'back' : 'close'}
          accessibilityLabel={onBack ? '뒤로 가기' : '닫기'}
          onPress={onPress}
          size={headerIcon[size]}
          strokeWidth={isLg ? 2.6 : 2.5}
          touchSize={height}
          color={color}
        />
      )}
      {title && (
        <Text variant="bodyStrong" accessibilityRole="header" style={[styles.headerTitle, { color }]}>
          {title}
        </Text>
      )}
    </View>
  );
}

/* ---------- ScreenTitle ---------- */

// 보호자 화면 제목은 한 단계씩 작게. 당사자(30 이상)는 그대로
const titleSize = { 22: 20, 24: 22, 28: 24, 30: 30, 36: 36 } as const;

type ScreenTitleProps = {
  title: string;
  description?: string;
  /** 22: 플로우 단계 · 24: 화면 제목 · 30–36: 당사자 / 완료. 기존 28은 24로 맞춘다 */
  size?: 22 | 24 | 28 | 30 | 36;
  /** body 16 · rBody 18 (당사자) */
  descriptionSize?: 16 | 18 | 20;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
};

export function ScreenTitle({
  title,
  description,
  size = 24,
  descriptionSize = 16,
  align = 'left',
  tone = 'light',
  style,
}: ScreenTitleProps) {
  const isDark = tone === 'dark';
  return (
    <View style={[{ gap: descriptionSize === 20 ? space[3] : space[2] }, style]}>
      <Text
        variant="title1"
        accessibilityRole="header"
        style={{
          fontSize: titleSize[size],
          lineHeight: Math.round(titleSize[size] * 1.35),
          letterSpacing: titleSize[size] * (size >= 30 ? -0.03 : -0.02),
          fontFamily: size >= 30 ? fontFamily.extraBold : fontFamily.bold,
          textAlign: align,
          color: isDark ? colors.textOnDark : colors.textPrimary,
        }}
      >
        {title}
      </Text>
      {description && (
        <Text
          variant={descriptionSize === 16 ? 'body' : 'rBody'}
          color={descriptionSize === 20 ? 'textPrimary' : 'textSecondary'}
          style={{
            fontSize: descriptionSize === 16 ? 15 : descriptionSize,
            lineHeight: Math.round(descriptionSize * (descriptionSize === 20 ? 1.5 : 1.6)),
            textAlign: align,
          }}
        >
          {description}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  scrollTabsBottom: {
    paddingBottom: space[6],
  },
  footer: {
    gap: screen.buttonGap,
    paddingTop: space[4],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
  },
  headerTitle: {
    fontSize: 16,
  },
});
