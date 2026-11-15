import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { ConfirmDialog } from '@/features/guardian/ConfirmDialog';
import { getBackgroundServiceState, startBackgroundService, stopBackgroundService } from '@/native/background';
import {
  areNotificationsEnabled,
  enableNotifications,
  isIgnoringBatteryOptimizations,
  isSamsung,
  openAppDetails,
  requestIgnoreBatteryOptimizations,
} from '@/native/deviceSettings';
import { canDrawOverlays, openOverlaySettings } from '@/native/launch';
import RecipientSetupScreen, { type SetupItem, type SetupStatus } from '@/screens/recipient/RecipientSetupScreen';

type DeviceState = {
  service: boolean;
  notifications: boolean;
  overlay: boolean;
  battery: boolean;
};

function readDeviceState(): DeviceState {
  return {
    service: getBackgroundServiceState().enabled,
    notifications: areNotificationsEnabled(),
    overlay: canDrawOverlays(),
    battery: isIgnoringBatteryOptimizations(),
  };
}

const on = (value: boolean): SetupStatus => (value ? 'on' : 'off');

// 당사자 폰 설정 안내 (B-9). 설정 앱에 다녀오면 상태를 다시 읽는다.
export default function RecipientSetupRoute() {
  // 계정 연결 직후(from=link)에는 '설정 완료'로 대기 화면에 간다
  const { from } = useLocalSearchParams<{ from?: string }>();
  const afterLink = from === 'link';
  const [state, setState] = useState(readDeviceState);
  const [confirmStop, setConfirmStop] = useState(false);
  const refresh = useCallback(() => setState(readDeviceState()), []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  const items: SetupItem[] = [
    {
      key: 'service',
      title: '손울림 대기',
      reason: '앱을 닫아도 전원 버튼 3번으로 켜고 신호를 받아요',
      status: on(state.service),
      actionLabel: '대기 켜기',
      onAction: async () => {
        await startBackgroundService();
        refresh();
      },
      // 상단 '손울림이 대기 중이에요' 알림이 거슬리거나 잠시 쓰지 않을 때. 실수로 끄지 않게 확인 창을 거친다
      offLabel: '대기 끄기',
      onOff: () => setConfirmStop(true),
    },
    {
      key: 'notifications',
      title: '알림',
      reason: '신호가 오면 알림으로 화면을 켜요',
      status: on(state.notifications),
      actionLabel: '알림 허용하기',
      onAction: async () => {
        await enableNotifications();
        refresh();
      },
    },
    {
      key: 'overlay',
      title: '다른 앱 위에 표시',
      reason: '잠금화면 위로 손울림을 띄워요',
      status: on(state.overlay),
      actionLabel: '설정에서 허용하기',
      onAction: openOverlaySettings,
      steps: "목록에서 '손울림'을 찾아 켜 주세요.",
    },
    {
      key: 'battery',
      title: '배터리 최적화 제외',
      reason: '오래 쉬어도 신호가 늦게 오지 않아요',
      status: on(state.battery),
      actionLabel: '최적화 중지하기',
      onAction: requestIgnoreBatteryOptimizations,
    },
  ];

  if (isSamsung()) {
    items.push(
      {
        key: 'samsung-battery',
        title: '삼성 절전 예외',
        reason: '삼성 절전 기능이 손울림을 멈추지 않게 해요',
        status: 'manual',
        actionLabel: '앱 정보 열기',
        onAction: openAppDetails,
        steps: "앱 정보 → 배터리 → '제한 없음'을 골라 주세요.",
      },
      {
        key: 'side-button',
        title: '측면 버튼 두 번 누르기 끄기',
        reason: '전원 버튼을 빠르게 눌러도 카메라가 켜지지 않게 해요',
        status: 'manual',
        steps: "설정 → 유용한 기능 → 측면 버튼 → '두 번 누르기'를 꺼 주세요.",
      },
    );
  }

  return (
    <>
    <RecipientSetupScreen
      items={items}
      onBack={() => (afterLink ? router.replace('/recipient') : router.canGoBack() ? router.back() : router.replace('/recipient/settings'))}
      onDone={afterLink ? () => router.replace('/recipient') : undefined}
    />
    <ConfirmDialog
      visible={confirmStop}
      icon="warning"
      destructive
      title="손울림 대기를 끌까요?"
      message="끄면 화면이 꺼진 상태에서 전원 버튼 3번으로 손울림을 켤 수 없어요. 신호는 앱이 꺼져 있어도 계속 받아요."
      confirmLabel="대기 끄기"
      onCancel={() => setConfirmStop(false)}
      onConfirm={() => {
        stopBackgroundService();
        setConfirmStop(false);
        // 서비스가 멈추는 데 잠깐 걸리므로 조금 뒤 다시 읽는다
        setTimeout(refresh, 500);
      }}
    />
    </>
  );
}
