import type { SignalStatus } from '@/components';

/** 홈 상단 당사자 상태 카드 */
export type RecipientStatus = {
  state?: 'OK' | 'WAITING' | 'NO_RESPONSE' | 'HELP_REQUESTED';
  signalName?: string;
  name: string;
  connected: boolean;
  /** 마지막으로 받은 응답 (없으면 undefined) */
  lastReply?: { label: string; minutesAgo: number };
  /**
   * 응답을 기다리는 신호가 있으면 보낸 뒤 지난 시간(분).
   * waitMinutes를 넘기면 카드가 주의 표시로 바뀐다.
   */
  pendingMinutes?: number;
  /** 응답 대기 시간 (설정값, 기본 10분) */
  waitMinutes: number;
};

/** 최근 활동 한 줄 (신호 기록 08과 같은 id) */
export type Activity = {
  id: string;
  signalName: string;
  /** 'HH:mm' */
  sentAt: string;
  status: SignalStatus;
  /** 당사자에게서 받은 기록(보호자 부르기 · 도움 요청). 없으면 보낸 기록 */
  received?: boolean;
};

/** 당사자 휴대폰이 마지막으로 알려 준 위치. 이동 경로·과거 위치는 저장하지 않는다 */
export type RecipientLocation = {
  /** 당사자가 위치 공유를 켰는지 */
  sharing: boolean;
  /** 'HH:mm' */
  updatedAt: string;
  minutesAgo: number;
  address: string;
  addressSummary: string;
  accuracyMeters: number;
  /** 실제 좌표. 있으면 지도 그림 대신 진짜 지도에 핀을 찍는다 (미리보기 목 데이터에는 없음) */
  point?: { latitude: number; longitude: number };
};

/** 응답 없음 상세(05-5)의 진행 단계 */
export type DeliveryStep = {
  label: string;
  detail?: string;
  time: string;
  /** false: 확인되지 않은 단계 (점선 원) */
  done: boolean;
};

export type NoReplyRecord = {
  id: string;
  signalId: string;
  signalName: string;
  recipientName: string;
  sentAtLabel: string;
  steps: readonly DeliveryStep[];
};
