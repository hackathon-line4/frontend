import { requireOptionalNativeModule } from 'expo';
import { PermissionsAndroid, Platform } from 'react-native';

// 당사자 폰 상시 대기 서비스 (B-5). 앱이 꺼져 있어도 상단 알림과 함께 계속 돈다.
// 네이티브 모듈이 없는 곳(Expo Go·웹)에서는 아무 일도 하지 않는다.

export type BackgroundServiceState = {
  /** 지금 서비스가 돌고 있음 */
  running: boolean;
  /** 켜두기로 저장됨 (재부팅 후 다시 켜짐) */
  enabled: boolean;
};

type SonullimNativeModule = {
  startBackgroundService(): void;
  stopBackgroundService(): void;
  getBackgroundServiceState(): BackgroundServiceState;
};

const native = requireOptionalNativeModule<SonullimNativeModule>('SonullimNative');

/**
 * 서비스 켜기. Android 13+는 알림 권한이 없으면 상단 알림이 안 보이므로 먼저 요청한다
 * (거절해도 서비스는 돈다).
 */
export async function startBackgroundService(): Promise<void> {
  if (!native) return;
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  }
  native.startBackgroundService();
}

export function stopBackgroundService() {
  native?.stopBackgroundService();
}

export function getBackgroundServiceState(): BackgroundServiceState {
  return native?.getBackgroundServiceState() ?? { running: false, enabled: false };
}
