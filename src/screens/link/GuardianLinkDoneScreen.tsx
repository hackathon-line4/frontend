import { StyleSheet } from 'react-native';

import { Button, Card, ProfileRow, Screen, ScreenTitle, Stack, SuccessMark, Tag } from '@/components';
import { radius, space } from '@/theme';

type Props = {
  recipientName: string;
  onHome: () => void;
};

// 04-G4 보호자 · 연결 완료 (design/screens/LinkG4.dc.html)
export default function GuardianLinkDoneScreen({ recipientName, onHome }: Props) {
  return (
    <Screen
      scroll
      reserveHeader="md"
      paddingTop={10}
      gap={8}
      align="center"
      footer={
        <Button label="홈으로" onPress={onHome} />
      }
    >
      <Stack gap={7} align="center">
        <SuccessMark label="연결 완료" />
        <ScreenTitle
          title="연결됐어요"
          description={`이제 ${recipientName}님과 메시지를 주고받을 수 있어요.`}
          size={30}
          align="center"
        />
      </Stack>
      <Card variant="emphasis" style={styles.card}>
        <ProfileRow
          name={recipientName}
          caption="당사자"
          size="md"
          trailing={<Tag icon="link" label="연결됨" tone="dark" />}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: 'stretch',
    borderRadius: radius.lg,
    paddingVertical: space[4],
    paddingHorizontal: space[5],
  },
});
