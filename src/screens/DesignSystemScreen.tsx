import { useState, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppHeader,
  Button,
  Card,
  CheckboxRow,
  Chip,
  CodeInput,
  Grid,
  InfoBox,
  ListRow,
  Logo,
  PageDots,
  RadioCard,
  RecipientScreen,
  Rhythm,
  Row,
  SegmentedTabs,
  SignalBadge,
  SignalTile,
  Stack,
  StatusChip,
  StepBar,
  SwitchRow,
  TabBar,
  Text,
  TextField,
  type RecipientState,
  type SignalStatus,
  type TabKey,
} from '@/components';
import { colors, radius, screen, space, touch, typography, type TypeVariant } from '@/theme';

// 디자인 시스템 미리보기 (design/screens/DS-*.dc.html 대응). 실제 화면 작업 전 확인용.

const typeSamples: [TypeVariant, string][] = [
  ['display', '손울림'],
  ['title1', '당사자와 연결해요'],
  ['title2', '촉신호 목록에서 고르기'],
  ['heading', '자주 쓰는 신호'],
  ['bodyStrong', '나 여기 있어'],
  ['body', '연결하면 서로 메시지를 주고받을 수 있어요.'],
  ['label', '이메일'],
  ['caption', '마지막 업데이트 18:51 · 3분 전'],
  ['small', '2단계 · 진동 리듬 만들기'],
  ['code', '482 913'],
  ['rDisplay', '누가 왔어'],
  ['rTitle', '연결 코드 입력'],
  ['rButton', '연결하기'],
  ['rBody', '보호자에게 받은 숫자 6자리'],
];

const swatches: (keyof typeof colors)[] = [
  'yellow500',
  'yellow100',
  'ink900',
  'ink950',
  'bgIvory',
  'surface',
  'surfaceSunken',
  'surfaceMuted',
  'lineSubtle',
  'line',
  'lineStrong',
  'borderInput',
  'textSecondary',
  'textTertiary',
  'textDisabled',
  'emergency',
];

const statuses: SignalStatus[] = ['replied', 'delivered', 'unconfirmed', 'failed', 'waiting', 'connected', 'noReply'];

const recipientLabels: Record<RecipientState, string> = {
  idle: '손울림 대기 중. 이영희 보호자와 연결됨. 두 번 탭하면 신호 보내기, 3초 길게 누르면 도움 요청',
  compose: '보호자 부르기 보내기. 화면 어디든 누르면 이영희 보호자에게 보내요',
  sent: '보냈어요. 잠시 뒤 대기 화면으로 돌아가요',
  incoming: '이영희, 누가 왔어. 화면 어디든 누르면 응답해요',
  replied: '응답했어요. 잠시 뒤 대기 화면으로 돌아가요',
};

export default function DesignSystemScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('48');
  const [mode, setMode] = useState<'list' | 'custom'>('list');
  const [segment, setSegment] = useState<'preset' | 'combine'>('preset');
  const [category, setCategory] = useState('일상');
  const [noReplyAlert, setNoReplyAlert] = useState(true);
  const [touchAlert, setTouchAlert] = useState(false);
  const [agree, setAgree] = useState(true);
  const [tab, setTab] = useState<TabKey>('home');
  const [recipient, setRecipient] = useState<RecipientState | null>(null);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <AppHeader title="디자인 시스템" />
      <ScrollView contentContainerStyle={styles.content}>
        <Logo />

        <Section title="컬러">
          <Grid columns={3} gap={3}>
            {swatches.map((key) => (
              <Stack key={key} gap={1}>
                <View style={[styles.swatchColor, { backgroundColor: colors[key] }]} />
                <View>
                  <Text variant="small">{key}</Text>
                  <Text variant="small" color="textSecondary">
                    {colors[key]}
                  </Text>
                </View>
              </Stack>
            ))}
          </Grid>
        </Section>

        <Section title="타이포그래피">
          {typeSamples.map(([variant, sample]) => (
            <View key={variant}>
              <Text variant="small" color="textSecondary">
                {variant} · {typography[variant].fontSize}
              </Text>
              <Text variant={variant}>{sample}</Text>
            </View>
          ))}
        </Section>

        <Section title="Button">
          <Button label="다음" />
          <Button label="회원가입" variant="secondary" />
          <Button label="시작하기" variant="dark" />
          <Button label="연결 요청하기" disabled />
          <Button label="다시 보내기" variant="secondary" icon="retry" />
          <Button label="나중에 할게요" variant="text" />
          <Button label="긴급 신호" variant="emergency" />
          <Button label="연결하기" size="lg" />
        </Section>

        <Section title="TextField">
          <TextField label="이메일" placeholder="example@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <TextField label="비밀번호" password defaultValue="abc" error="8자 이상 입력해 주세요" />
          <CodeInput value={code} onChangeText={setCode} label="연결 코드 (당사자)" />
        </Section>

        <Section title="Selection">
          <Stack gap={3} accessibilityRole="radiogroup">
            <RadioCard label="촉신호 목록에서 고르기" selected={mode === 'list'} onPress={() => setMode('list')} />
            <RadioCard label="직접 만들기" selected={mode === 'custom'} onPress={() => setMode('custom')} />
          </Stack>
          <SegmentedTabs
            options={[
              { value: 'preset', label: '프리셋에서 고르기' },
              { value: 'combine', label: '직접 조합하기' },
            ]}
            value={segment}
            onChange={setSegment}
          />
          <Row gap={2} align="stretch">
            {['일상', '외출', '확인', '긴급'].map((c) => (
              <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
            ))}
          </Row>
          <SwitchRow label="응답 없음 알림" value={noReplyAlert} onValueChange={setNoReplyAlert} />
          <SwitchRow label="터치 응답 알림" value={touchAlert} onValueChange={setTouchAlert} />
          <CheckboxRow checked={agree} onChange={setAgree} accessibilityLabel="필수, 이용약관에 동의해요">
            <Text variant="label" weight="medium">
              <Text variant="label">[필수]</Text> 이용약관에 동의해요
            </Text>
          </CheckboxRow>
        </Section>

        <Section title="Badge · StatusChip">
          <Row wrap gap={3}>
            <SignalBadge type="basic" />
            <SignalBadge type="custom" />
            <SignalBadge type="untrained" />
          </Row>
          <Row wrap gap={3}>
            {statuses.map((s) => (
              <StatusChip key={s} status={s} />
            ))}
          </Row>
        </Section>

        <Section title="RhythmGlyph">
          <Row wrap gap={3}>
            <Rhythm beats={['L', 'S', 'M']} size="sm" />
            <Rhythm beats={['L', 'S', 'M']} size="md" />
            <Rhythm beats={['L', 'S', 'M']} size="lg" playingIndex={1} />
          </Row>
        </Section>

        <Section title="Card · SignalTile · ListRow · InfoBox">
          <Row wrap gap={3}>
            <SignalTile name="가자" icon="sig-arrow" badge="basic" beats={['S', 'L', 'S']} style={styles.tile} />
            <SignalTile name="약 먹을 시간" icon="sig-pill" badge="custom" beats={['M', 'M']} style={styles.tile} />
          </Row>
          <Card style={styles.listCard}>
            <ListRow title="나 여기 있어" subtitle="18:47 보냄" trailing={<StatusChip status="replied" />} />
            <ListRow title="다른 당사자 연결하기" icon="plus" divider onPress={() => {}} />
          </Card>
          <InfoBox tone="neutral">neutral · 도움말, 표시 기준 안내</InfoBox>
          <InfoBox tone="brand">brand · 꼭 알아야 할 안내 (예: 연습 필요)</InfoBox>
          <InfoBox tone="caution">caution · 연결 확인 안 됨, 응답 없음</InfoBox>
        </Section>

        <Section title="Progress">
          <StepBar total={4} current={2} />
          <PageDots total={3} current={1} />
        </Section>

        <Section title="RecipientScreen">
          <Row wrap gap={3}>
            {(Object.keys(recipientLabels) as RecipientState[]).map((s) => (
              <Pressable
                key={s}
                onPress={() => setRecipient(s)}
                accessibilityRole="button"
                accessibilityLabel={`${s} 미리보기`}
                style={styles.recipientThumb}
              >
                <Text variant="small">{s}</Text>
              </Pressable>
            ))}
          </Row>
        </Section>
      </ScrollView>

      <TabBar active={tab} onSelect={setTab} />

      <Modal visible={recipient !== null} animationType="fade" onRequestClose={() => setRecipient(null)}>
        {recipient && (
          <RecipientScreen
            state={recipient}
            signalName={recipient === 'incoming' ? '누가\n왔어' : recipient === 'compose' ? '보호자 부르기' : undefined}
            accessibilityLabel={recipientLabels[recipient]}
            onPress={() => setRecipient(null)}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack gap={4}>
      <Text variant="title2" accessibilityRole="header">
        {title}
      </Text>
      <Stack gap={3}>{children}</Stack>
    </Stack>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bgIvory,
  },
  content: {
    padding: screen.gutter,
    gap: screen.sectionGap,
    paddingBottom: space[10],
  },
  // 미리보기 견본 크기
  swatchColor: {
    height: 48,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tile: {
    width: 168,
  },
  listCard: {
    paddingVertical: space[1],
  },
  recipientThumb: {
    minWidth: 96,
    height: touch.guardianMin,
    paddingHorizontal: space[3],
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
