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

import { colors, screen } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

/* ---------- Screen ---------- */

type ScreenProps = {
  children: ReactNode;
  /** 화면 위 고정 (뒤로 가기 헤더 등) */
  header?: ReactNode;
  /** 화면 아래 고정 (주요 버튼). 본문과 사이는 비워 둔다 */
  footer?: ReactNode;
  /** 입력 화면: 스크롤 + 키보드 회피 */
  scroll?: boolean;
  /** dark: 어두운 화면 (QR 인식 등) */
  tone?: 'light' | 'dark';
  contentStyle?: StyleProp<ViewStyle>;
};

// 모든 단계 화면의 기본 틀. 좌우 여백 24, 하단 여백 = 안전영역 + 24.
export function Screen({ children, header, footer, scroll, tone = 'light', contentStyle }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const background = tone === 'dark' ? colors.ink900 : colors.bgIvory;

  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, contentStyle]}>{children}</View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.root,
          { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) + 24 },
        ]}
      >
        {header}
        {body}
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </KeyboardAvoidingView>
  );
}

/* ---------- ScreenHeader ---------- */

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

  return (
    <View style={[styles.header, { height: isLg ? 56 : 48, marginLeft: isLg ? -12 : -10 }]}>
      {onPress && (
        <IconButton
          icon={onBack ? 'back' : 'close'}
          accessibilityLabel={onBack ? '뒤로 가기' : '닫기'}
          onPress={onPress}
          size={isLg ? 30 : 26}
          strokeWidth={isLg ? 2.6 : 2.5}
          touchSize={isLg ? 56 : 48}
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

type ScreenTitleProps = {
  title: string;
  description?: string;
  /** 24: 플로우 단계 · 28: 화면 제목 · 30–36: 당사자 / 완료 */
  size?: 24 | 28 | 30 | 36;
  /** body 16 · rBody 18 (당사자) */
  descriptionSize?: 16 | 18 | 20;
  align?: 'left' | 'center';
  tone?: 'light' | 'dark';
  style?: StyleProp<ViewStyle>;
};

export function ScreenTitle({
  title,
  description,
  size = 28,
  descriptionSize = 16,
  align = 'left',
  tone = 'light',
  style,
}: ScreenTitleProps) {
  const isDark = tone === 'dark';
  return (
    <View style={style}>
      <Text
        variant="title1"
        accessibilityRole="header"
        style={{
          fontSize: size,
          lineHeight: Math.round(size * (size >= 30 ? 1.35 : 1.3)),
          letterSpacing: size * -0.03,
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
          style={[
            styles.description,
            {
              fontSize: descriptionSize,
              lineHeight: Math.round(descriptionSize * (descriptionSize === 20 ? 1.5 : 1.6)),
              textAlign: align,
              marginTop: descriptionSize === 20 ? 12 : 8,
            },
          ]}
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
    paddingHorizontal: screen.gutterRecipient,
  },
  scrollContent: {
    flexGrow: 1,
  },
  footer: {
    gap: screen.buttonGap,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 17,
  },
  description: {
    marginTop: 8,
  },
});
