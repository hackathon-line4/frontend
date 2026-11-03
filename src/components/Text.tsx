import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, fontFamily, typography, type ColorToken, type TypeVariant } from '@/theme';

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: ColorToken;
  /** variant의 크기는 두고 굵기만 바꾼다 (400 · 500 · 800) */
  weight?: 'regular' | 'medium' | 'extraBold';
};

export function Text({ variant = 'body', color = 'textPrimary', weight, style, ...rest }: TextProps) {
  return (
    <RNText
      style={[typography[variant], { color: colors[color] }, weight && { fontFamily: fontFamily[weight] }, style]}
      {...rest}
    />
  );
}
