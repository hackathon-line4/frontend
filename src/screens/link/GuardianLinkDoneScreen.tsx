import { StyleSheet, View } from 'react-native';

import { Button, Card, ProfileRow, Screen, ScreenTitle, SuccessMark, Tag } from '@/components';

type Props = {
  recipientName: string;
  onSendFirstMessage: () => void;
  onHome: () => void;
};

// 04-G4 보호자 · 연결 완료 (design/screens/LinkG4.dc.html)
export default function GuardianLinkDoneScreen({ recipientName, onSendFirstMessage, onHome }: Props) {
  return (
    <Screen
      scroll
      contentStyle={styles.content}
      footer={
        <View>
          <Button label="첫 메시지 보내기" onPress={onSendFirstMessage} />
          <Button label="홈으로" variant="text" underline={false} onPress={onHome} style={styles.home} />
        </View>
      }
    >
      <SuccessMark label="연결 완료" />
      <ScreenTitle
        title="연결됐어요"
        description={`이제 ${recipientName}님과 메시지를 주고받을 수 있어요.`}
        size={30}
        align="center"
        style={styles.title}
      />
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
  content: {
    alignItems: 'center',
    paddingTop: 88,
  },
  title: {
    marginTop: 28,
  },
  card: {
    alignSelf: 'stretch',
    marginTop: 32,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  home: {
    marginTop: 8,
  },
});
