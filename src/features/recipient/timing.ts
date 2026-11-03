// 07 당사자 송신·수신 시간 (recvSpec). 값은 사용성 검증 후 확정.

/** 07-2: 이 시간 동안 터치가 없으면 보내지 않고 대기로 */
export const SEND_IDLE_TIMEOUT_MS = 10_000;

/** 07-3 보냄 · 07-5 응답 완료: 이 시간 뒤 대기로 자동 복귀 */
export const STATUS_RETURN_MS = 3_000;

/** 07-4: 이 시간 동안 응답이 없으면 반복 진동만 멈추고 조용히 대기로 (기본 10분, 검증 필요) */
export const NO_REPLY_TIMEOUT_MS = 10 * 60 * 1000;
