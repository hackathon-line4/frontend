import { StyleSheet, View } from 'react-native';

import { Button, NumberedSteps, Screen, ScreenHeader, ScreenTitle, Stack } from '@/components';
import { LinkPhonesIllustration } from '@/components/Illustrations';
import { colors, radius } from '@/theme';

type Props = {
  onBack: () => void;
  onCreateCode: () => void;
};

// 04-G1 보호자 · 연결 시작 (design/screens/LinkG1.dc.html)
export default function GuardianLinkStartScreen({ onBack, onCreateCode }: Props) {
  return (
    <Screen
      scroll
      header={<ScreenHeader title="계정 연결" onBack={onBack} />}
      footer={<Button label="연결 코드 만들기" icon="plus" onPress={onCreateCode} />}
      paddingTop={6}
      gap={8}
    >
      <View style={styles.visual} importantForAccessibility="no-hide-descendants">
        <View style={styles.tint}>
          <LinkPhonesIllustration />
        </View>
      </View>
      <Stack gap={6}>
        <ScreenTitle title="당사자와 연결해요" description="연결하면 서로 메시지를 주고받을 수 있어요." />
        <NumberedSteps
          steps={['연결 코드를 만들어요', '당사자 휴대폰에 코드를 입력해요', '연결 요청을 확인하면 완료돼요']}
        />
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  visual: {
    alignItems: 'center',
  },
  // 일러스트 배경 원 (일러스트 고유 크기)
  tint: {
    width: 200,
    height: 200,
    borderRadius: radius.full,
    backgroundColor: colors.yellow100,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
