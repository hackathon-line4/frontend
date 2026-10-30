import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, typography } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'dark' | 'text' | 'emergency';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** md: 보호자 앱 58 · lg: 당사자 앱 80 */
  size?: 'md' | 'lg';
  icon?: IconName;
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
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const isLg = size === 'lg';
  const fg = disabled ? colors.textTertiary : foreground[variant];

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
        isLg ? styles.lg : styles.md,
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
        icon && <Icon name={icon} size={isLg ? 26 : 20} color={fg} strokeWidth={2.4} />
      )}
      <Text
        style={[
          isLg ? typography.rButton : typography.heading,
          variant === 'text' && styles.textLabel,
          { color: fg },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const foreground: Record<ButtonVariant, string> = {
  primary: colors.textPrimary,
  secondary: colors.textPrimary,
  dark: colors.textOnDark,
  text: colors.textSecondary,
  emergency: colors.surface,
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  md: {
    minHeight: 58,
    borderRadius: radius.md,
  },
  lg: {
    minHeight: 80,
    borderRadius: radius.lg,
    gap: 10,
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

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.yellow500 },
  secondary: { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.ink900 },
  dark: { backgroundColor: colors.ink900 },
  text: { backgroundColor: 'transparent', minHeight: 48 },
  emergency: {
    backgroundColor: colors.ink950,
    minHeight: 60,
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
    gap: 12,
  },
});
