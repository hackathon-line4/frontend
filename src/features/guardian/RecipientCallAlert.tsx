import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button, Card, Icon, Stack, Text } from '@/components';
import { useSession } from '@/features/session';
import { colors, radius, space } from '@/theme';

import { dismissRecipientCall, useRecipientCall } from './recipientCall';

// 보호자 앱 안에서 '보호자 부르기'를 알리는 창. OS 기본 창 대신 앱 디자인으로 그린다.
// 문구: 'OOO님이 OOO님을 불렀어요'
export function RecipientCallAlert() {
  const call = useRecipientCall();
  const session = useSession();
  if (!call) return null;

  const recipient = call.senderName ?? session.links.find((l) => l.status === 'ACTIVE')?.recipient.name ?? '당사자';
  const guardian = session.user?.name ?? '보호자';
  const message = `${recipient}님이 ${guardian}님을 불렀어요`;

  const open = () => {
    dismissRecipientCall();
    router.push({ pathname: '/guardian/record/[id]', params: { id: call.id, kind: 'RECIPIENT_SIGNAL' } });
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={dismissRecipientCall} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissRecipientCall} accessibilityRole="button" accessibilityLabel="닫기" />
        <Card variant="emphasis" style={styles.card}>
          <Stack gap={4} align="center">
            <View style={styles.iconCircle} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Icon name="bell" size={30} strokeWidth={2.4} />
            </View>
            <Stack gap={2} align="center" accessible accessibilityRole="alert" accessibilityLabel={`보호자 부르기. ${message}`}>
              <Text variant="label" color="textSecondary">
                보호자 부르기
              </Text>
              <Text variant="heading" style={styles.center}>
                {message}
              </Text>
            </Stack>
            <Stack gap={2} style={styles.actions}>
              <Button label="확인하기" onPress={open} />
              <Button label="닫기" variant="text" underline={false} onPress={dismissRecipientCall} />
            </Stack>
          </Stack>
        </Card>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: space[6],
    backgroundColor: 'rgba(28, 28, 28, 0.45)',
  },
  card: { paddingVertical: space[6], paddingHorizontal: space[5] },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.yellow100,
  },
  center: { textAlign: 'center' },
  actions: { alignSelf: 'stretch' },
});
