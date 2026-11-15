import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fontFamily, space } from '@/theme';

import { Text } from './Text';

// logo/wordmark. 노란 파동은 아이보리·흰 바탕에서 장식으로만 사용.
export function Logo({ size = 'lg' }: { size?: 'lg' | 'sm' }) {
  const isLg = size === 'lg';
  const fontSize = isLg ? 52 : 24;
  return (
    <View style={[styles.row, { gap: isLg ? space[1] : space[0] }]} accessible accessibilityRole="image" accessibilityLabel="손울림">
      <Text style={[styles.word, { fontSize, lineHeight: fontSize, letterSpacing: fontSize * -0.04 }]}>손울림</Text>
      <Svg width={isLg ? 22 : 13} height={isLg ? 30 : 18} viewBox="0 0 22 30" fill="none">
        <Path d="M4 9 q4 6 0 12" stroke={colors.yellow500} strokeWidth={isLg ? 3.5 : 4} strokeLinecap="round" />
        <Path d="M12 4 q8 11 0 22" stroke={colors.yellow500} strokeWidth={isLg ? 3.5 : 4} strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  word: {
    fontFamily: fontFamily.extraBold,
    // Noto Sans KR 위아래 여백 때문에 lineHeight = fontSize 에서 잘리지 않게
    paddingTop: space[1],
  },
});
