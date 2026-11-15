// 08 신호 기록 데이터 모델 (design/screen-map.md ## logSpec)
// '기기 전달'과 '터치 응답'은 항상 따로 기록하고 따로 표시한다. 하나로 합치지 않는다.
// 시각은 모두 'HH:MM:SS' (당사자·보호자 기기 시간대 기준), 날짜는 'YYYY-MM-DD'.

/** 기기 전달 상태 */
export type DeliveryState =
  /** 서버에 요청했고 아직 결과 없음 */
  | { kind: 'requesting' }
  /** 서버 또는 네트워크 오류로 보내지 못함 */
  | { kind: 'failed'; reason: string }
  /** 당사자 앱이 수신 확인(ack)을 보낸 경우에만. 푸시 발송 성공만으로는 쓰지 않음 */
  | { kind: 'delivered'; at: string; /** 진동 재생 (기기 보고) */ vibratedAt?: string }
  /** 기기가 꺼져 있거나 오프라인이라 전달 여부를 알 수 없음 */
  | { kind: 'unknown' };

/** 터치 응답 상태. 기기 전달 완료 뒤에만 생긴다 */
export type ResponseState =
  /** 전달 후 대기 시간 안 */
  | { kind: 'waiting'; elapsedMin: number }
  /** 당사자의 명시적 터치가 서버에 기록됨 */
  | { kind: 'replied'; at: string; /** 전달 후 걸린 시간 (초) */ afterSec: number }
  /** 대기 시간 동안 터치 기록 없음 */
  | { kind: 'noReply'; waitMin: number };

/** 보호자가 보낸 신호 */
export type SignalRecord = {
  id: string;
  type: 'signal';
  date: string;
  signalId: string;
  name: string;
  /** 신호의 뜻 한 줄 */
  meaning: string;
  sentAt: string;
  delivery: DeliveryState;
  /** delivery가 delivered일 때만 값이 있다 */
  response: ResponseState | null;
  /** 이 신호와 관련된 도움 요청 */
  relatedHelpId?: string;
};

/** 도움 요청 때 함께 공유된 위치. 요청 순간 1회만 저장 (지속 추적 없음) */
export type SharedLocation = {
  address: string;
  latitude: number;
  longitude: number;
  /** 위치 기준 시각 */
  at: string;
  accuracyM: number;
};

/** 당사자가 보낸 도움 요청 (3초 길게 누르기) */
export type HelpRequestRecord = {
  id: string;
  type: 'help';
  date: string;
  /** 당사자가 보냄 */
  sentAt: string;
  /** 내 휴대폰에 도착 */
  arrivedAt: string;
  /** 내가 열어 봄 (보호자 자신의 기록) */
  openedAt?: string;
  location: SharedLocation | null;
  /** 이후 주고받은 신호 기록 id */
  followUpIds: readonly string[];
};

export type HistoryRecord = SignalRecord | HelpRequestRecord;

export type HistoryFilter = 'all' | 'noReply';
