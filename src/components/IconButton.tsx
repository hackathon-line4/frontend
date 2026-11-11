import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, touch } from '@/theme';

import { Icon, type IconName } from './Icon';

type IconButtonProps = {
  icon: IconName;
  /** 아이콘만 있는 버튼은 레이블 필수 */
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** 터치 영역. 보호자 48 이상, 당사자 56 이상 */
  touchSize?: number;
  style?: StyleProp<ViewStyle>;
};

export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  disabled = false,
  size = 24,
  color = colors.textPrimary,
  strokeWidth = 2.4,
  touchSize = touch.guardianMin,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ disabled }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.base,
        { width: touchSize, height: touchSize },
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Icon name={icon} size={size} color={color} strokeWidth={strokeWidth} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
  disabled: { opacity: 0.4 },
});
