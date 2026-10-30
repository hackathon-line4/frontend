import type { TextStyle } from 'react-native';

// 굵기는 400 · 500 · 800 세 단계만 사용. 숫자 코드는 Roboto Mono.
// 폰트 파일마다 family 이름이 따로 있어서 fontWeight 대신 fontFamily로 굵기를 고른다.
export const fontFamily = {
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  extraBold: 'NotoSansKR_800ExtraBold',
  monoMedium: 'RobotoMono_500Medium',
  monoBold: 'RobotoMono_700Bold',
} as const;

type TypeSpec = {
  size: number;
  lineHeight: number; // 배수
  family: string;
  letterSpacing?: number; // em
};

const spec: Record<string, TypeSpec> = {
  display: { size: 44, lineHeight: 1.1, family: fontFamily.extraBold, letterSpacing: -0.04 },
  title1: { size: 28, lineHeight: 1.3, family: fontFamily.extraBold, letterSpacing: -0.03 },
  title2: { size: 24, lineHeight: 1.35, family: fontFamily.extraBold, letterSpacing: -0.03 },
  heading: { size: 18, lineHeight: 1.4, family: fontFamily.extraBold },
  bodyStrong: { size: 16, lineHeight: 1.5, family: fontFamily.extraBold },
  body: { size: 16, lineHeight: 1.6, family: fontFamily.regular },
  label: { size: 15, lineHeight: 1.5, family: fontFamily.extraBold },
  caption: { size: 14, lineHeight: 1.55, family: fontFamily.regular },
  small: { size: 13, lineHeight: 1.5, family: fontFamily.medium },
  badge: { size: 11, lineHeight: 1, family: fontFamily.extraBold },
  code: { size: 48, lineHeight: 1, family: fontFamily.monoBold, letterSpacing: 0.08 },

  // 당사자 앱 스케일 (최소 18, 주요 글자 20 이상)
  rDisplay: { size: 52, lineHeight: 1.15, family: fontFamily.extraBold, letterSpacing: -0.04 },
  rTitle: { size: 32, lineHeight: 1.35, family: fontFamily.extraBold, letterSpacing: -0.03 },
  rButton: { size: 22, lineHeight: 1.3, family: fontFamily.extraBold },
  rBody: { size: 18, lineHeight: 1.6, family: fontFamily.medium },
};

export type TypeVariant =
  | 'display'
  | 'title1'
  | 'title2'
  | 'heading'
  | 'bodyStrong'
  | 'body'
  | 'label'
  | 'caption'
  | 'small'
  | 'badge'
  | 'code'
  | 'rDisplay'
  | 'rTitle'
  | 'rButton'
  | 'rBody';

function toTextStyle({ size, lineHeight, family, letterSpacing }: TypeSpec): TextStyle {
  return {
    fontFamily: family,
    fontSize: size,
    lineHeight: Math.round(size * lineHeight),
    letterSpacing: letterSpacing ? size * letterSpacing : 0,
  };
}

export const typography = Object.fromEntries(
  Object.entries(spec).map(([key, value]) => [key, toTextStyle(value)]),
) as Record<TypeVariant, TextStyle>;
