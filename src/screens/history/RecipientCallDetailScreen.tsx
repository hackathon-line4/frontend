import { StyleSheet } from 'react-native';

import { Screen, ScreenHeader, ScreenTitle, Stack, Tag, Text } from '@/components';
import { withSubject } from '@/features/history';
import { RecordSection, TimelineRow } from '@/features/history/RecordSection';

type Props = {
  recipientName: string;
  guardianName: string;
  /** 'HH:MM:SS' */
  sentAt: string;
  arrivedAt?: string;
  openedAt?: string;
  onBack: () => void;
};

// 08 보호자 부르기 기록. 도움 요청 기록(HelpRequestDetailScreen)과 같은 구성으로 맞춘다.
export default function RecipientCallDetailScreen({ recipientName, guardianName, sentAt, arrivedAt, openedAt, onBack }: Props) {
  return (
    <Screen scroll header={<ScreenHeader title="신호 기록" onBack={onBack} />} paddingTop={3} gap={5}>
      <Stack gap={3}>
        <Tag label="당사자가 보낸 기록" icon="back" style={styles.tag} />
        <ScreenTitle
          title="보호자 부르기"
          description={`${recipientName}님이 ${guardianName}님을 불렀어요`}
        />
      </Stack>

      <RecordSection title="기록">
        <TimelineRow label="당사자가 보냄" time={sentAt} />
        {arrivedAt ? (
          <TimelineRow label="내 휴대폰에 도착" time={arrivedAt} />
        ) : (
          <Text variant="caption" color="textSecondary">
            내 휴대폰 도착 기록이 아직 없어요.
          </Text>
        )}
        {openedAt && <TimelineRow label="내가 열어 봄" time={openedAt} />}
      </RecordSection>

      <Text variant="caption" color="textSecondary">
        {`${withSubject(recipientName)} 대기 화면을 두 번 눌러 보냈어요. 위치는 함께 보내지 않아요.`}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tag: { alignSelf: 'flex-start' },
});
