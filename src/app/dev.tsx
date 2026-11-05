import { router, type Href } from 'expo-router';

import { Card, ListRow, Screen, ScreenTitle, SegmentedTabs, Stack, Text } from '@/components';
import { setRole, useRole, type Role } from '@/features/session';

import SonullimNative from '../../modules/sonullim-native';

// B-1 네이티브 진동 확인용. S·M·L (0.2·0.5·0.9초, 간격 0.3초)
const TEST_TIMINGS = [0, 200, 300, 500, 300, 900];
const testAmplitudes = (level: number) => TEST_TIMINGS.map((_, i) => (i % 2 === 1 ? level : 0));

// 개발용 화면 목록. 서버 연결 전에는 이어지지 않는 화면(요청 수신, 승인 완료 등)을 여기서 바로 연다.
// 보호자/당사자 화면은 역할이 맞아야 열리므로 위에서 역할을 먼저 고른다.
type Item = [label: string, href: Href, role?: Role];

const sections: { title: string; items: Item[] }[] = [
  {
    title: '01–03 시작 · 로그인',
    items: [
      ['01 스플래시', '/'],
      ['02 온보딩', '/onboarding'],
      ['03-1 로그인', '/auth/login'],
      ['03-2 회원가입', '/auth/signup'],
      ['03-3 역할 선택', '/auth/role'],
    ],
  },
  {
    title: '04 계정 연결',
    items: [
      ['04-G1 연결 시작', '/link/guardian'],
      ['04-G2 연결 코드', '/link/guardian/code'],
      ['04-G3 연결 요청 확인', '/link/guardian/request'],
      ['04-G4 연결 완료', '/link/guardian/done', 'guardian'],
      ['04-R1 코드 입력', '/link/recipient'],
      ['04-R2 QR 인식', '/link/recipient/scan'],
      ['04-R3 연결 대상 확인', '/link/recipient/confirm'],
      ['04-R4 연결 완료', '/link/recipient/done', 'recipient'],
    ],
  },
  {
    title: '05 보호자 홈 · 신호 · 위치',
    items: [
      ['05-1 보호자 홈', '/guardian', 'guardian'],
      ['05-2 신호 탭', '/guardian/signals', 'guardian'],
      ['05-3 위치 탭', '/guardian/location', 'guardian'],
      ['05-4 신호 상세', '/guardian/signal/go', 'guardian'],
      ['05-5 응답 없음 상세', '/guardian/no-reply', 'guardian'],
    ],
  },
  {
    title: '06 진동 설정 (두 역할 공통)',
    items: [
      ['06-1 내 진동 설정', '/calibration'],
      ['06-2 진동 테스트 중', '/calibration/test'],
      ['06-3 느낌 확인', '/calibration/feel'],
      ['06-4 잘 안 느껴질 때', '/calibration/help'],
      ['06-5 설정 저장', '/calibration/save'],
    ],
  },
  {
    title: '07 당사자 송신 · 수신',
    items: [
      ['07-1 대기', '/recipient', 'recipient'],
      ['07-2 신호 보내기', '/recipient/send', 'recipient'],
      ['07-3 보냄', '/recipient/sent', 'recipient'],
      ['07-4 신호 수신', '/recipient/incoming', 'recipient'],
      ['07-5 응답 완료', '/recipient/replied', 'recipient'],
    ],
  },
  {
    title: '08 신호 기록',
    items: [
      ['08-1 신호 기록', '/guardian/history', 'guardian'],
      ['08-2 기록 상세 · 응답 완료', '/guardian/record/r-replied', 'guardian'],
      ['08-3 기록 상세 · 도움 요청', '/guardian/record/r-help', 'guardian'],
    ],
  },
  {
    title: '09 설정',
    items: [
      ['09-1 보호자 설정', '/guardian/settings', 'guardian'],
      ['09-2 연결이 안 될 때', '/guardian/connection-help', 'guardian'],
      ['09-3 당사자 설정', '/recipient/settings', 'recipient'],
    ],
  },
  {
    title: '10 신호 추가',
    items: [
      ['10-1 종류 선택', '/guardian/add-signal', 'guardian'],
      ['10-2 목록에서 고르기', '/guardian/add-signal/list', 'guardian'],
      ['10-3 직접 만들기', '/guardian/add-signal/custom', 'guardian'],
      ['10-4·5 리듬 (프리셋 · 직접 조합)', '/guardian/add-signal/rhythm', 'guardian'],
      ['10-6 진동 체험', '/guardian/add-signal/feel', 'guardian'],
      ['10-7 저장 완료', '/guardian/add-signal/done', 'guardian'],
    ],
  },
  {
    title: '기타',
    items: [['디자인 시스템', '/design-system']],
  },
];

export default function DevRoute() {
  const role = useRole();

  const open = ([, href, needs]: Item) => {
    if (needs) setRole(needs);
    router.push(href);
  };

  return (
    <Screen scroll>
      <Stack gap={6} paddingY={4}>
        <ScreenTitle title="화면 목록" description="개발 확인용 · 역할은 나중에 서버에서 받아와요" size={24} />
        <Stack gap={2}>
          <Text variant="label" color="textSecondary">
            현재 역할
          </Text>
          <SegmentedTabs
            options={[
              { value: 'guardian', label: '보호자' },
              { value: 'recipient', label: '당사자' },
            ]}
            value={role ?? 'guardian'}
            onChange={setRole}
          />
        </Stack>
        <Stack gap={2}>
          <Text variant="label" color="textSecondary">
            네이티브 진동 (세기 조절 {SonullimNative.hasAmplitudeControl() ? '지원' : '미지원'})
          </Text>
          <Card>
            <ListRow
              title="S·M·L 강하게"
              onPress={() => SonullimNative.vibrateWaveform(TEST_TIMINGS, testAmplitudes(255))}
            />
            <ListRow
              title="S·M·L 약하게"
              divider
              onPress={() => SonullimNative.vibrateWaveform(TEST_TIMINGS, testAmplitudes(60))}
            />
            <ListRow title="진동 멈추기" divider onPress={() => SonullimNative.cancelVibration()} />
          </Card>
        </Stack>
        {sections.map((section) => (
          <Stack key={section.title} gap={2}>
            <Text variant="label" color="textSecondary">
              {section.title}
            </Text>
            <Card>
              {section.items.map((item, i) => (
                <ListRow key={item[0]} title={item[0]} divider={i > 0} onPress={() => open(item)} />
              ))}
            </Card>
          </Stack>
        ))}
      </Stack>
    </Screen>
  );
}
