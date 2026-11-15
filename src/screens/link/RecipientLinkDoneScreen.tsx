import { useEffect } from 'react';
import { AccessibilityInfo } from 'react-native';

import { Button, Screen, ScreenTitle, SuccessMark } from '@/components';

type Props = {
  guardianName: string;
  onDone: () => void;
};

// 04-R4 당사자 · 연결 완료 (design/screens/LinkR4.dc.html)
export default function RecipientLinkDoneScreen({ guardianName, onDone }: Props) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${guardianName} 보호자와 연결됐어요`);
  }, [guardianName]);

  return (
    <Screen
      align="center"
      justify="center"
      gap={8}
      footer={<Button label="확인" variant="dark" size="lg" onPress={onDone} />}
    >
      <SuccessMark size={180} label="연결 완료" />
      <ScreenTitle
        title="연결됐어요"
        description={`${guardianName} 보호자와\n연결됐어요`}
        size={36}
        descriptionSize={20}
        align="center"
      />
    </Screen>
  );
}
