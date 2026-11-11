import { router } from 'expo-router';
import { useSyncExternalStore } from 'react';

import type { IncomingMessage, ServerBeat } from '@/api';
import { beatsToPulses, type Beat, type Pulses } from '@/theme';

// 07-4 신호 수신의 공통 입구.
// 앱이 열려 있으면 SSE(message.created), 닫혀 있으면 FCM 데이터 메시지로 같은 IncomingMessage가 온다.
// 어느 쪽으로 오든 handleIncoming 하나로 받는다.

/** 07-4 화면이 쓰는 받은 신호 */
export type IncomingSignal = {
  messageId: string;
  isEmergency: boolean;
  isPractice: boolean;
  senderName: string;
  signalName: string;
  /** 진동 배열 [울림, 쉼, …] ms */
  pulses: Pulses;
  /** 반복 사이 쉬는 시간. undefined면 앱 기본값 */
  repeatGapMs?: number;
  /** 이 시간이 지나면 반복 진동만 멈춘다. undefined면 응답·응답 없음까지 */
  maxPlayMs?: number;
};

const beatFromServer: Record<ServerBeat, Beat> = { SHORT: 'S', MEDIUM: 'M', LONG: 'L' };

/** 서버 신호 → 진동 배열. pulses가 오면 그대로, 없으면 박자에서 계산 */
export function signalPulses(signal: IncomingMessage['signal']): Pulses {
  if (signal.pulses?.length) return signal.pulses;
  return beatsToPulses((signal.rhythm ?? []).map((b) => beatFromServer[b]));
}

export function toIncomingSignal(message: IncomingMessage): IncomingSignal {
  const { repeatIntervalSec, maxDurationSec } = message.playbackPolicy;
  return {
    messageId: message.id,
    isEmergency: message.isEmergency,
    isPractice: message.kind === 'PRACTICE',
    senderName: message.guardianName,
    signalName: message.signal.name,
    pulses: signalPulses(message.signal),
    repeatGapMs: repeatIntervalSec != null ? repeatIntervalSec * 1000 : undefined,
    maxPlayMs: maxDurationSec != null ? maxDurationSec * 1000 : undefined,
  };
}

let current: IncomingSignal | null = null;
/** SSE와 FCM으로 같은 신호가 두 번 와도 한 번만 처리 */
const handled = new Set<string>();
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getCurrent = () => current;

export function useIncomingSignal(): IncomingSignal | null {
  return useSyncExternalStore(subscribe, getCurrent, getCurrent);
}

/** 받은 신호를 저장하고 07-4 화면을 연다. 진동은 07-4 화면이 시작한다 */
export function handleIncoming(message: IncomingMessage) {
  if (handled.has(message.id)) return;
  handled.add(message.id);
  // TODO: POST /messages/{messageId}/ack (기기 도착 확인)
  current = toIncomingSignal(message);
  listeners.forEach((listener) => listener());
  router.push('/recipient/incoming');
}

/** 응답 · 응답 없음으로 07-4를 닫을 때 */
export function clearIncoming() {
  current = null;
  listeners.forEach((listener) => listener());
}
