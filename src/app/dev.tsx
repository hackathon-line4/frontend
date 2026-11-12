import * as Clipboard from 'expo-clipboard';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { Card, ListRow, Screen, ScreenTitle, SegmentedTabs, Stack, Text } from '@/components';
import type { IncomingMessage } from '@/api';
import { handleIncoming } from '@/features/recipient';
import { setRole, useRole, type Role } from '@/features/session';
import { tactilePulses } from '@/features/signals';
import {
  getVibrationCapability,
  playFeedback,
  playRhythm,
  stopRhythm,
  type FeedbackKind,
} from '@/features/vibration';
import { getBackgroundServiceState, startBackgroundService, stopBackgroundService } from '@/native/background';
import { canDrawOverlays, openOverlaySettings } from '@/native/launch';
import { getPushToken, isPushConfigured } from '@/native/push';
import type { Beat } from '@/theme';

// 진동 엔진 확인용. 보정값(세기·길이·반복)은 06 진동 설정의 저장값을 쓴다
const TEST_BEATS: Beat[] = ['S', 'M', 'L'];

const feedbackRows: [label: string, kind: FeedbackKind][] = [
  ['확인 · 연결 상태', 'connection'],
  ['확인 · 보냄', 'sent'],
  ['확인 · 실패', 'failed'],
  ['확인 · 카운트다운 1회', 'countdown'],
  ['확인 · 앱 켜짐', 'launched'],
];

/** 서버 없이 07-4 수신 확인: SSE·FCM이 넘겨줄 IncomingMessage와 같은 모양 */
function simulateIncoming(kind: 'normal' | 'emergency' | 'custom') {
  const base = {
    id: `dev-${Date.now()}`,
    kind: 'SIGNAL',
    guardianName: '이영희',
    waitUntil: null,
    sentAt: new Date().toISOString(),
  } as const;
  const messages: Record<typeof kind, IncomingMessage> = {
    normal: {
      ...base,
      isEmergency: false,
      signal: { name: '누가 왔어', rhythm: null, pulses: [...tactilePulses.visitor], durationMs: 2250 },
      playbackPolicy: { repeatIntervalSec: null, maxDurationSec: null, bypassDnd: false },
    },
    emergency: {
      ...base,
      isEmergency: true,
      signal: { name: '위험해', rhythm: null, pulses: [...tactilePulses.danger], durationMs: 7450 },
      playbackPolicy: { repeatIntervalSec: 10, maxDurationSec: 60, bypassDnd: true },
    },
    // pulses 없이 박자만 오는 경우 (백엔드가 pulses를 추가하기 전)
    custom: {
      ...base,
      isEmergency: false,
      signal: { name: '약 먹을 시간', rhythm: ['LONG', 'SHORT', 'SHORT'], durationMs: 1600 },
      playbackPolicy: { repeatIntervalSec: null, maxDurationSec: null, bypassDnd: false },
    },
  };
  handleIncoming(messages[kind]);
}

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
      ['당사자 폰 설정 안내 (B-9)', '/recipient/setup', 'recipient'],
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

function vibrationTitle() {
  const { available, amplitudeControl } = getVibrationCapability();
  if (!available) return '진동 엔진 (네이티브 모듈 없음 · Expo Go)';
  return `진동 엔진 (세기 조절 ${amplitudeControl ? '지원' : '미지원'})`;
}

export default function DevRoute() {
  const role = useRole();
  const [service, setService] = useState(getBackgroundServiceState);
  // 서비스는 시작 요청 후 조금 뒤에 켜지므로 잠깐 기다렸다 읽는다
  const refreshService = () =>
    setTimeout(() => {
      setService(getBackgroundServiceState());
      setOverlay(canDrawOverlays());
    }, 300);
  // 전원 3번으로 앱을 띄우려면 필요. 설정에서 돌아오면 다시 읽는다
  const [overlay, setOverlay] = useState(canDrawOverlays);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshService();
    });
    return () => sub.remove();
  }, []);

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
            {vibrationTitle()}
          </Text>
          <Card>
            <ListRow
              title="S·M·L 강하게 · 1번"
              onPress={() => playRhythm(TEST_BEATS, { strength: 3, length: 2, repeat: 1 })}
            />
            <ListRow
              title="S·M·L 약하게 · 1번"
              divider
              onPress={() => playRhythm(TEST_BEATS, { strength: 1, length: 2, repeat: 1 })}
            />
            <ListRow
              title="S·M·L 길게 · 2번 반복"
              divider
              onPress={() => playRhythm(TEST_BEATS, { strength: 3, length: 3, repeat: 2 })}
            />
            <ListRow title="내 진동 설정으로 재생" divider onPress={() => playRhythm(TEST_BEATS)} />
            {feedbackRows.map(([label, kind]) => (
              <ListRow key={kind} title={label} divider onPress={() => playFeedback(kind)} />
            ))}
            <ListRow title="진동 멈추기" divider onPress={stopRhythm} />
          </Card>
        </Stack>
        <Stack gap={2}>
          <Text variant="label" color="textSecondary">
            07-4 신호 수신 시뮬레이션 (당사자 역할에서)
          </Text>
          <Card>
            <ListRow title="'누가 왔어' 받기" onPress={() => simulateIncoming('normal')} />
            <ListRow title="긴급 '위험해' 받기 · 10초 간격 최대 1분" divider onPress={() => simulateIncoming('emergency')} />
            <ListRow title="박자만 있는 신호 받기 · 길게 짧게 짧게" divider onPress={() => simulateIncoming('custom')} />
          </Card>
        </Stack>
        <Stack gap={2}>
          <Text variant="label" color="textSecondary">
            백그라운드 서비스 ({service.running ? '실행 중' : '꺼짐'}
            {service.enabled ? ' · 재부팅 후 자동 켜짐' : ''} · 전원 3번 감지 {service.powerTriggers}회)
          </Text>
          <Card>
            <ListRow
              title="서비스 켜기"
              onPress={async () => {
                await startBackgroundService();
                refreshService();
              }}
            />
            <ListRow
              title="서비스 끄기"
              divider
              onPress={() => {
                stopBackgroundService();
                refreshService();
              }}
            />
            <ListRow title="상태 새로고침" divider onPress={refreshService} />
            <ListRow
              title={`다른 앱 위에 표시: ${overlay ? '허용됨' : '꺼짐 → 설정 열기'}`}
              divider
              onPress={openOverlaySettings}
            />
            <ListRow
              title={isPushConfigured() ? 'FCM 토큰 복사 (콘솔 테스트용)' : 'FCM 꺼짐 · google-services.json 없음'}
              divider
              onPress={async () => {
                const token = await getPushToken();
                if (!token) return;
                await Clipboard.setStringAsync(token);
                console.log('[push] FCM 토큰', token);
              }}
            />
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
