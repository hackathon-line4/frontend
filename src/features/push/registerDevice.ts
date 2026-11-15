import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { api } from '@/api';
import { getInstallationId } from '@/features/session/installation';
import { getVibrationCapability } from '@/features/vibration';
import { getPushToken } from '@/native/push';

// 이 기기의 푸시 토큰을 서버에 등록한다 (PUT /me/devices/{installationId}).
// 서버는 신호를 보낼 때 받는 사람의 토큰으로 FCM에 맡긴다.
// 같은 사용자 · 같은 토큰이면 다시 보내지 않는다. 토큰이 바뀌면(재설치 등) 다시 등록된다.

let lastRegistered: string | null = null;

export type RegisterResult = 'registered' | 'unchanged' | 'no-token';

export async function registerDevice(userId: string, signal?: AbortSignal): Promise<RegisterResult> {
  if (Platform.OS !== 'android') return 'no-token';
  const pushToken = await getPushToken();
  if (!pushToken) return 'no-token';
  const key = `${userId}:${pushToken}`;
  if (key === lastRegistered) return 'unchanged';

  const installationId = await getInstallationId();
  await api.request(`/me/devices/${encodeURIComponent(installationId)}`, {
    method: 'PUT',
    body: {
      platform: 'ANDROID',
      pushToken,
      appVersion: Constants.expoConfig?.version ?? '0.0.0',
      supportsVibrationIntensity: getVibrationCapability().amplitudeControl,
    },
    signal,
  });
  lastRegistered = key;
  return 'registered';
}

/** 로그아웃 · 계정 전환 뒤에는 다시 등록해야 한다 */
export function resetDeviceRegistration() {
  lastRegistered = null;
}
