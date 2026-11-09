import { playFeedback, repeatSignal } from '@/features/vibration';
import type { Pulses } from '@/theme';

// 당사자 앱 동작. 진동은 연결됨, 서버는 연결 전 자리.
// 확인 진동 패턴(features/vibration/feedback.ts)은 기기에서 검증 후 확정.

/** 07-1 한 번 탭: 전송 없음. 연결 상태 확인 진동만 */
export function playConnectionCheck() {
  playFeedback('connection');
}

/** 3초 길게 누르는 동안 1초마다 짧은 진동 (3초째는 requestHelp의 확인 진동) */
export function playHelpCountdown() {
  playFeedback('countdown');
}

/** 3초 길게 누르기: 도움 요청 */
export function requestHelp() {
  // TODO: 서버로 도움 요청 전송. 지금은 성공했다고 보고 확인 진동만
  playFeedback('sent');
}

/**
 * 07-2 신호 보내기. 서버가 전송 요청을 받았다고 확인하면 true.
 * 실패하면 false → '보냄'을 표시하지 않고 07-2 유지
 */
export async function sendSignal(_signalName: string): Promise<boolean> {
  // TODO: 서버로 신호 전송
  const ok = true;
  playFeedback(ok ? 'sent' : 'failed');
  return ok;
}

/**
 * 07-4 응답 보내기. 서버가 터치 응답을 받았다고 확인하면 true.
 * 실패하면 false → 07-4 유지 + 자동 재시도
 */
export async function replyToSignal(): Promise<boolean> {
  // TODO: 서버로 터치 응답 전송. 실패 시 자동 재시도
  const ok = true;
  // 07-5 확인 진동 1회
  if (ok) playFeedback('sent');
  return ok;
}

let stopIncoming: (() => void) | undefined;

/** 07-4 신호 진동 반복 시작. 신호 진동 배열 + 내 진동 설정(보정값). 간격·횟수는 검증 후 결정 */
export function startIncomingVibration(pulses: Pulses) {
  stopIncomingVibration();
  stopIncoming = repeatSignal(pulses);
}

export function stopIncomingVibration() {
  stopIncoming?.();
  stopIncoming = undefined;
}
