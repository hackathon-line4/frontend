import { StyleSheet } from 'react-native';

import { Logo, Stack, Text } from '@/components';
import { colors, space } from '@/theme';

// 01 스플래시 (design/screens/Main.dc.html). 버튼·터치 요소 없음.
export default function SplashScreen() {
  return (
    <Stack
      flex
      align="center"
      justify="center"
      gap={3}
      style={styles.root}
      accessible
      accessibilityLabel="손울림, 소리 없이 마음을 전하다"
      accessibilityLiveRegion="polite"
    >
      <Logo />
      <Text variant="small">소리 없이, 마음을 전하다</Text>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.bgIvory,
    paddingBottom: space[6],
  },
});
