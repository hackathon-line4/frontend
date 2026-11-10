export type ServerRole = 'GUARDIAN' | 'RECIPIENT';
export type Tokens = { accessToken: string; refreshToken: string };
export type User = { id: string; email: string; name: string; role: ServerRole | null; createdAt: string };
export type Link = {
  id: string;
  status: 'ACTIVE' | 'ENDED';
  guardian: { id: string; name: string };
  recipient: { id: string; name: string };
  linkedAt: string;
  connection: { state: 'CONFIRMED' | 'UNCONFIRMED' | 'UNKNOWN'; lastConfirmedAt: string | null };
};
export type PendingLinkRequest = {
  id: string; status: 'PENDING';
  guardian: { id: string; name: string };
  recipient: { id: string; name: string; role: 'RECIPIENT' };
  code: string; requestedAt: string; expiresAt: string; decidedAt: null; link: null;
};
export type Me = { user: User; links: Link[]; pendingLinkRequest: PendingLinkRequest | null };
export type AuthResult = Tokens & { user: User; links: Link[] };

/** 박자 (공통 데이터 형식 Signal.rhythm) */
export type ServerBeat = 'SHORT' | 'MEDIUM' | 'LONG';

/**
 * 당사자가 받는 신호 (공통 데이터 형식 IncomingMessage).
 * SIGNAL·PRACTICE 푸시 데이터, SSE message.created, GET /messages/incoming 항목이 모두 이 모양.
 */
export type IncomingMessage = {
  id: string;
  kind: 'SIGNAL' | 'PRACTICE';
  isEmergency: boolean;
  guardianName: string;
  signal: {
    name: string;
    /** 직접 만든 신호의 박자. 기본 신호는 null일 수 있다 */
    rhythm: ServerBeat[] | null;
    /** 진동 배열 [울림, 쉼, …] ms. 백엔드에 추가 요청함 (없으면 rhythm에서 계산) */
    pulses?: number[] | null;
    durationMs: number;
  };
  /** null은 앱 기본값. 긴급 신호는 10 / 60 / true */
  playbackPolicy: { repeatIntervalSec: number | null; maxDurationSec: number | null; bypassDnd: boolean };
  waitUntil: string | null;
  sentAt: string;
};
