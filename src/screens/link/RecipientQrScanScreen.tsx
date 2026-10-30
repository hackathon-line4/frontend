import { StyleSheet, View } from 'react-native';

import { Button, Screen, ScreenHeader, ScreenTitle, StatusMessage } from '@/components';
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
      contentStyle={styles.content}
      header={<ScreenHeader size="lg" tone="dark" onClose={onClose} />}
      footer={<Button label="코드 직접 입력" icon="keyboard" variant="light" size="lg" onPress={onEnterCode} />}
    >
      <ScreenTitle title={'보호자 화면의 QR을\n비춰 주세요'} align="center" tone="dark" style={styles.title} />
      <View style={styles.camera} accessible accessibilityRole="image" accessibilityLabel="카메라 화면">
        <ScanFrame />
      </View>
      <View style={styles.status}>
        <StatusMessage icon="vibrate-wave" variant="pill">
          가까워질수록 진동이 빨라져요
        </StatusMessage>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  title: {
    marginTop: 16,
  },
  camera: {
    marginTop: 36,
    width: 260,
    height: 260,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceInverse,
  },
  status: {
    marginTop: 28,
  },
});
