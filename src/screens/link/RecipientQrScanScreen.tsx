import { StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader, ScreenTitle, Stack, StatusMessage } from '@/components';
import { ScanFrame } from '@/components/Illustrations';
import { colors, radius } from '@/theme';

type Props = {
  onClose: () => void;
  onEnterCode: () => void;
};

// 04-R2 당사자 · QR 인식 (design/screens/LinkR2.dc.html)
// TODO: 카메라 미리보기 + QR 인식 (expo-camera). 인식되면 R3로 자동 이동.
export default function RecipientQrScanScreen({ onClose, onEnterCode }: Props) {
  return (
    <Screen
      tone="dark"
      align="center"
      paddingTop={4}
      gap={8}
      header={<ScreenHeader size="lg" tone="dark" onClose={onClose} />}
      footer={<Button label="코드 직접 입력" icon="keyboard" variant="light" size="lg" onPress={onEnterCode} />}
    >
      <ScreenTitle title={'보호자 화면의 QR을\n비춰 주세요'} align="center" tone="dark" />
      <Stack gap={7} align="center">
        <View style={styles.camera} accessible accessibilityRole="image" accessibilityLabel="카메라 화면">
          <ScanFrame />
        </View>
        <StatusMessage icon="vibrate-wave" variant="pill">
          가까워질수록 진동이 빨라져요
        </StatusMessage>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // 카메라 미리보기 자리 (ScanFrame 고유 크기)
  camera: {
    width: 260,
    height: 260,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceInverse,
  },
});
