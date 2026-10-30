import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { Avatar, Button, Card, Screen, ScreenTitle, StatusMessage, Tag, Text } from '@/components';
import { fontFamily } from '@/theme';

type Props = {
  guardianName: string;
  /** '연결하기'를 누른 뒤 보호자 승인을 기다리는 중 */
  waiting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// 04-R3 당사자 · 연결 대상 확인 (design/screens/LinkR3.dc.html)
export default function RecipientConfirmScreen({ guardianName, waiting, onConfirm, onCancel }: Props) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${guardianName} 보호자와 연결할까요?`);
  }, [guardianName]);

  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        waiting ? (
          <>
            <StatusMessage icon="more" large>
              보호자의 확인을 기다리고 있어요
            </StatusMessage>
            <Button label="취소" icon="close" variant="secondary" size="lg" onPress={onCancel} />
          </>
        ) : (
          <>
            <Button label="연결하기" icon="check" size="lg" onPress={onConfirm} />
            <Button label="아니요" icon="close" variant="secondary" size="lg" onPress={onCancel} />
          </>
        )
      }
    >
      <ScreenTitle title={'이 보호자와\n연결할까요?'} size={30} align="center" />
      <Card variant="emphasis" style={styles.card}>
        <Avatar name={guardianName} size="xl" />
        <Text style={styles.name}>{guardianName}</Text>
        <Tag icon="shield" label="보호자" size="lg" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 68,
  },
  card: {
    marginTop: 36,
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  name: {
    fontFamily: fontFamily.extraBold,
    fontSize: 30,
    lineHeight: 40,
  },
});
