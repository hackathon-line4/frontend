import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// 개발 빌드에서만 보이는 '화면 목록(/dev)' 바로가기. 제출 APK(릴리스)에는 나오지 않는다.
// 당사자 화면처럼 전체 터치를 받는 화면을 가리지 않게 왼쪽 아래 작게 둔다.
export default function DevShortcut() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (!__DEV__ || pathname === '/dev') return null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="개발용 화면 목록 열기"
      hitSlop={8}
      onPress={() => router.push('/dev')}
      style={({ pressed }) => [styles.button, { bottom: insets.bottom + 12 }, pressed && styles.pressed]}
    >
      <Text style={styles.label}>DEV</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  pressed: {
    opacity: 0.6,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
