import { StyleSheet } from 'react-native';

import { Button, Card, DefinitionList, Note, ProfileRow, Screen, ScreenHeader, ScreenTitle, Stack, Tag } from '@/components';
import { formatLinkCode } from '@/features/link/code';
import { linkMethodLabel, type LinkMethod } from '@/features/link/mock';
import { space } from '@/theme';

type Props = {
  recipientName: string;
  code: string;
  method: LinkMethod;
  requestedAt: string;
  onBack: () => void;
  onAccept: () => void;
  onReject: () => void;
};

// 04-G3 보호자 · 연결 요청 확인 (design/screens/LinkG3.dc.html)
// 거절하거나 10분 동안 응답이 없으면 요청 취소.
export default function GuardianLinkRequestScreen({
  recipientName,
  code,
  method,
  requestedAt,
  onBack,
  onAccept,
  onReject,
}: Props) {
  return (
    <Screen
      scroll
      header={<ScreenHeader title="계정 연결" onBack={onBack} />}
      paddingTop={5}
      gap={7}
      footer={
        <>
          <Button label="연결하기" onPress={onAccept} />
          <Button label="거절하기" variant="secondary" onPress={onReject} />
        </>
      }
    >
      <Stack gap={3}>
        <Tag icon="bell" label="새 연결 요청" style={styles.tag} />
        <ScreenTitle title={'이 당사자와\n연결할까요?'} />
      </Stack>

      <Stack gap={4}>
        <Card variant="emphasis" style={styles.card}>
          <ProfileRow name={recipientName} caption="당사자 계정" />
          <DefinitionList
            items={[
              ['사용한 코드', formatLinkCode(code)],
              ['연결 방법', linkMethodLabel[method]],
              ['요청 시간', requestedAt],
            ]}
          />
        </Card>
        <Note>내가 코드를 알려 준 사람이 맞는지 확인해 주세요.</Note>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tag: {
    alignSelf: 'flex-start',
  },
  card: {
    padding: space[6],
    gap: space[5],
  },
});
