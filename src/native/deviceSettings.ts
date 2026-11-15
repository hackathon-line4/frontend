import { requireOptionalNativeModule } from 'expo';
import { PermissionsAndroid, Platform } from 'react-native';

// 당사자 폰 설정 안내(B-9)에서 쓰는 설정 상태 확인 · 설정 화면 열기.
// 네이티브 모듈이 없는 곳(Expo Go·웹)에서는 모두 꺼진 것으로 보고, 여는 함수는 아무 일도 하지 않는다.

type SonullimNativeModule = {
  isIgnoringBatteryOptimizations(): boolean;
  requestIgnoreBatteryOptimizations(): void;
  areNotificationsEnabled(): boolean;
  openNotificationSettings(): void;
  openAppDetails(): void;
  isSamsung(): boolean;
};

const native = requireOptionalNativeModule<SonullimNativeModule>('SonullimNative');

export function isIgnoringBatteryOptimizations(): boolean {
  return native?.isIgnoringBatteryOptimizations() ?? false;
}

/** '배터리 사용량 최적화 중지' 확인 창 */
export function requestIgnoreBatteryOptimizations() {
  native?.requestIgnoreBatteryOptimizations();
}

export function areNotificationsEnabled(): boolean {
  return native?.areNotificationsEnabled() ?? false;
}
/** null means this runtime cannot inspect the OS permission. */
export function getNotificationPermission(): boolean | null {
  return native?.areNotificationsEnabled() ?? null;
}

/**
 * 알림 켜기. Android 13+는 먼저 권한 창을 띄우고, 이미 거절해서 창이 안 뜨면 앱 알림 설정 화면을 연다
 */
export async function enableNotifications() {
  if (!native) return;
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    if (result === PermissionsAndroid.RESULTS.GRANTED) return;
  }
  native.openNotificationSettings();
}

/** 앱 정보 화면 (삼성: 배터리 → 제한 없음) */
export function openAppDetails() {
  native?.openAppDetails();
}

export function isSamsung(): boolean {
  return native?.isSamsung() ?? false;
}
