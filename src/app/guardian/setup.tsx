import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import {
  areNotificationsEnabled,
  canUseFullScreenIntent,
  enableNotifications,
  isIgnoringBatteryOptimizations,
  isSamsung,
  openAppDetails,
  openFullScreenIntentSettings,
  requestIgnoreBatteryOptimizations,
} from '@/native/deviceSettings';
import RecipientSetupScreen, { type SetupItem, type SetupStatus } from '@/screens/recipient/RecipientSetupScreen';

// 보호자 휴대폰 설정 안내. 도움 요청 · 보호자 부르기 알림을 놓치지 않기 위한 설정만 모았다.
// (손울림 대기 · 다른 앱 위에 표시 · 위치는 당사자 전용이라 없음)
// 계정 연결 직후 한 번 나오고(from=link), 보호자 설정 → '휴대폰 설정 확인'에서 다시 연다.
function readState() {
  return {
    notifications: areNotificationsEnabled(),
    fullScreen: canUseFullScreenIntent(),
    battery: isIgnoringBatteryOptimizations(),
  };
}

const on = (value: boolean | null): SetupStatus => (value === null ? 'manual' : value ? 'on' : 'off');

export default function GuardianSetupRoute() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const afterLink = from === 'link';
  const [state, setState] = useState(readState);
  const refresh = useCallback(() => setState(readState()), []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const items: SetupItem[] = [
    {
      key: 'notifications',
      title: '알림',
      reason: '도움 요청 · 보호자 부르기 · 응답 없음을 알려 줘요',
      status: on(state.notifications),
      actionLabel: '알림 허용하기',
      onAction: async () => {
        await enableNotifications();
        refresh();
      },
    },
    {
      key: 'full-screen',
      title: '전체 화면 알림',
      reason: '도움 요청이 오면 잠금화면 위로 크게 띄워요',
      status: on(state.fullScreen),
      actionLabel: '설정에서 허용하기',
      onAction: openFullScreenIntentSettings,
      steps: state.fullScreen === false ? "'전체 화면 알림 허용'을 켜 주세요." : undefined,
    },
    {
      key: 'battery',
      title: '배터리 최적화 제외',
      reason: '휴대폰을 오래 두어도 도움 요청이 늦게 오지 않아요',
      status: on(state.battery),
      actionLabel: '최적화 중지하기',
      onAction: requestIgnoreBatteryOptimizations,
    },
  ];

  if (isSamsung()) {
    items.push({
      key: 'samsung-battery',
      title: '삼성 절전 예외',
      reason: '삼성 절전 기능이 알림을 늦추지 않게 해요',
      status: 'manual',
      actionLabel: '앱 정보 열기',
      onAction: openAppDetails,
      steps: "앱 정보 → 배터리 → '제한 없음'을 골라 주세요.",
    });
  }

  return (
    <RecipientSetupScreen
      role="guardian"
      title="휴대폰 설정 확인"
      description="당사자의 도움 요청을 바로 받으려면 아래 설정이 필요해요."
      items={items}
      onBack={() => (afterLink ? router.replace('/guardian') : router.canGoBack() ? router.back() : router.replace('/guardian/settings'))}
      onDone={afterLink ? () => router.replace('/guardian') : undefined}
    />
  );
}
