// 09 설정 (design/screen-map.md ## setSpec)

/** 상대 기기와의 연결 상태. 위험을 단정하지 않고 마지막 확인 시각만 적는다 */
export type ConnectionState = {
  status: 'connected' | 'unconfirmed';
  /** 마지막으로 연결을 확인한 시각 'HH:MM' */
  lastCheckedAt: string;
  /** 연결한 날 ('10월 26일') */
  linkedOn: string;
};

/** 응답 기다리는 시간 (분). 07의 미응답 기준과 같은 값. 값은 검증 후 확정 */
export type WaitMinutes = 5 | 10 | 30;
export const waitMinuteOptions: readonly WaitMinutes[] = [5, 10, 30];
export const defaultWaitMinutes: WaitMinutes = 10;

/** 위치 권한 (운영체제 값을 그대로 읽어 표시) */
export type LocationPermission = 'granted' | 'denied' | 'whileInUse' | 'approximate' | 'unknown';

export const locationPermissionLabel: Record<LocationPermission, string> = {
  unknown: '휴대폰 설정에서 확인',
  granted: '켜짐',
  denied: '꺼짐',
  whileInUse: '사용 중에만 허용',
  approximate: '정확한 위치 꺼짐',
};

/** 도움 요청 때 정확한 위치를 보낼 수 있는 권한인지 (백그라운드 권한은 요청하지 않음) */
export function canSendLocation(permission: LocationPermission): boolean {
  return permission === 'granted' || permission === 'whileInUse';
}

export type NotificationPermission = 'granted' | 'denied' | 'unknown';

export type GuardianSettings = {
  /** 터치 응답 알림 */
  replyAlert: boolean;
  /** 응답 없음 알림 */
  noReplyAlert: boolean;
  waitMinutes: WaitMinutes;
  // 도움 요청 알림은 항상 켜짐 (끌 수 없음, 정책 확인 필요) → 값으로 두지 않는다
};

export type RecipientSettings = {
  /** 도움 요청에 위치 보내기 (당사자 휴대폰에서만 바꿈) */
  shareLocationOnHelp: boolean;
};

/** 당사자의 진동 보정 결과 (보호자 화면에서는 읽기 전용) */
export type CalibrationSummary = {
  calibratedOn: string;
  strength: string;
  length: string;
  repeat: number;
};
