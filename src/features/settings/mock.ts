import type {
  CalibrationSummary,
  ConnectionState,
  GuardianSettings,
  LocationPermission,
  NotificationPermission,
  RecipientSettings,
} from './types';

// 서버 연결 전 화면 확인용 (design/screens/SettingsG · SettingsConnIssue · SettingsR)

export const mockConnection: ConnectionState = { status: 'connected', lastCheckedAt: '18:58', linkedOn: '10월 26일' };
/** 연결 확인 안 됨 화면 확인용 */
export const mockConnectionUnconfirmed: ConnectionState = {
  status: 'unconfirmed',
  lastCheckedAt: '16:40',
  linkedOn: '10월 26일',
};

export const mockGuardianSettings: GuardianSettings = { replyAlert: true, noReplyAlert: true, waitMinutes: 10 };
export const mockRecipientSettings: RecipientSettings = { shareLocationOnHelp: true };

export const mockCalibration: CalibrationSummary = {
  calibratedOn: '10월 26일',
  strength: '강하게',
  length: '보통',
  repeat: 2,
};

// TODO: expo-location getForegroundPermissionsAsync()로 실제 값 읽기 (앱이 앞으로 올 때마다 다시 확인)
export const mockLocationPermission: LocationPermission = 'denied';
// TODO: expo-notifications getPermissionsAsync()로 실제 값 읽기
export const mockNotificationPermission: NotificationPermission = 'granted';
