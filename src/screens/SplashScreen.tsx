import { StyleSheet, View } from 'react-native';

import { Logo, Text } from '@/components';
import { colors, fontFamily } from '@/theme';

// 01 스플래시 (design/screens/Main.dc.html). 버튼·터치 요소 없음.
export default function SplashScreen() {
  return (
    <View
      style={styles.root}
      accessible
      accessibilityLabel="손울림, 소리 없이 마음을 전하다"
      accessibilityLiveRegion="polite"
    >
      <Logo />
      <Text style={styles.tagline}>소리 없이, 마음을 전하다</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgIvory,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 24,
  },
  tagline: {
    marginTop: 12,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: -0.13,
  },
});
