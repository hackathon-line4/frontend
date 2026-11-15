import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { Avatar, Button, Card, Screen, ScreenTitle, StatusMessage, Tag, Text } from '@/components';
import { radius, space } from '@/theme';

type Props = {
  guardianName: string;
  /** '연결하기'를 누른 뒤 보호자 승인을 기다리는 중 */
  waiting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  error?: string;
  onRetry?: () => void;
};

// 04-R3 당사자 · 연결 대상 확인 (design/screens/LinkR3.dc.html)
export default function RecipientConfirmScreen({ guardianName, waiting, onConfirm, onCancel, error, onRetry }: Props) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`${guardianName} 보호자와 연결할까요?`);
  }, [guardianName]);

  return (
    <Screen
      scroll
      reserveHeader="lg"
      paddingTop={3}
      gap={8}
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
      {error && <>
        <Text accessibilityRole="alert" color="dangerFg">{error}</Text>
        <Button label="다시 확인" variant="secondary" size="lg" onPress={onRetry} />
      </>}
      <Card variant="emphasis" style={styles.card}>
        <Avatar name={guardianName} size="xl" />
        <Text variant="rTitle">{guardianName}</Text>
        <Tag icon="shield" label="보호자" size="lg" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingVertical: space[8],
    paddingHorizontal: space[6],
    alignItems: 'center',
    gap: space[3],
  },
});
