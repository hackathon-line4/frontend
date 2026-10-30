import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { colors, touch } from '@/theme';

import { Icon, type IconName } from './Icon';

type IconButtonProps = {
  icon: IconName;
  /** 아이콘만 있는 버튼은 레이블 필수 */
  accessibilityLabel: string;
  onPress?: () => void;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

// 터치 영역 48 × 48
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  size = 24,
  color = colors.textPrimary,
  style,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.base, pressed && styles.pressed, style]}
    >
      <Icon name={icon} size={size} color={color} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: touch.guardianMin,
    height: touch.guardianMin,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
});
