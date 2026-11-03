import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, space, touch, typography } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

/** light: 어두운 화면 위 밝은 버튼 (QR 인식 등) */
export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'light' | 'text' | 'emergency';

/** sm: 56 · 16 (나란한 보조 버튼) · md: 60 · 18 (보호자 앱) · lg: 80 · 22 (당사자 앱) */
export type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** 글자 뒤 아이콘 (예: '다음 →') */
  trailingIcon?: IconName;
  /** text 버튼 밑줄. 기본 true */
  underline?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};

// 한 화면에 primary는 1개만.
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  trailingIcon,
  underline = true,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const fg = disabled ? colors.textTertiary : foreground[variant];
  const iconSize = iconSizes[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {variant === 'emergency' ? (
        <View style={styles.emergencyIcon}>
          <Icon name="warning" size={20} color={colors.surface} strokeWidth={2.6} />
        </View>
      ) : (
        icon && <Icon name={icon} size={iconSize} color={fg} strokeWidth={2.4} />
      )}
      <Text
        style={[
          labelStyles[size],
          variant === 'text' && styles.textLabel,
          variant === 'text' && underline && styles.underline,
          { color: fg },
        ]}
      >
        {label}
      </Text>
      {trailingIcon && <Icon name={trailingIcon} size={iconSize} color={fg} strokeWidth={2.5} />}
    </Pressable>
  );
}

const foreground: Record<ButtonVariant, string> = {
  primary: colors.textPrimary,
  secondary: colors.textPrimary,
  dark: colors.textOnDark,
  light: colors.textPrimary,
  text: colors.textSecondary,
  emergency: colors.surface,
};

const iconSizes: Record<ButtonSize, number> = { sm: 20, md: 20, lg: 28 };

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    paddingHorizontal: space[4],
  },
  disabled: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.borderInput,
  },
  pressed: {
    opacity: 0.85,
  },
  textLabel: {
    fontSize: 16,
    lineHeight: 24,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  emergencyIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.emergency,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const sizeStyles = StyleSheet.create({
  sm: { minHeight: 56, borderRadius: radius.md },
  md: { minHeight: 60, borderRadius: radius.md },
  lg: { minHeight: touch.recipientPrimary, borderRadius: radius.lg, gap: space[3] },
});

const labelStyles = StyleSheet.create({
  sm: typography.bodyStrong,
  md: typography.heading,
  lg: typography.rButton,
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.yellow500 },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.ink900 },
  dark: { backgroundColor: colors.ink900 },
  light: { backgroundColor: colors.bgIvory },
  text: { backgroundColor: 'transparent', minHeight: touch.guardianMin, alignSelf: 'center' },
  emergency: {
    backgroundColor: colors.ink950,
    minHeight: 60,
    justifyContent: 'flex-start',
    paddingHorizontal: space[4],
    gap: space[3],
  },
});
