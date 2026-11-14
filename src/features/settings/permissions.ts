import { PermissionsAndroid, Platform } from 'react-native';
import { getNotificationPermission } from '@/native/deviceSettings';
import type { LocationPermission, NotificationPermission } from './types';

export type SettingsPermissions = { location: LocationPermission; notification: NotificationPermission };

/** 권한을 요청하지 않고 읽는다. 한 권한 조회 실패가 다른 결과를 지우지 않는다. */
export async function readSettingsPermissions(): Promise<SettingsPermissions> {
  const location = async (): Promise<LocationPermission> => {
    if (Platform.OS !== 'android') return 'unknown';
    try {
      const [fine, coarse, always] = await Promise.all([
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION),
        PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION).catch(() => false),
      ]);
      // '항상 허용'이면 앱이 꺼져 있어도 보호자의 위치 확인에 답할 수 있다
      return fine ? (always ? 'granted' : 'whileInUse') : coarse ? 'approximate' : 'denied';
    } catch { return 'unknown'; }
  };
  const notification = async (): Promise<NotificationPermission> => {
    try {
      const enabled = getNotificationPermission();
      return enabled === null ? 'unknown' : enabled ? 'granted' : 'denied';
    } catch { return 'unknown'; }
  };
  const [locationPermission, notificationPermission] = await Promise.all([location(), notification()]);
  return { location: locationPermission, notification: notificationPermission };
}
