import { mockGuardian } from '@/features/link/mock';
import { findSignal } from '@/features/signals';

import type { IncomingSignal } from './incoming';

// 서버 연결 전 화면 확인용 데이터
// TODO: 연결된 보호자 · 받은 신호는 서버(실시간 수신 / 푸시)에서 받아 온다

export const connectedGuardian = mockGuardian;

/** 당사자가 보낼 수 있는 신호. 지금은 1개 (종류는 검증 후 결정) */
export const outgoingSignalName = '보호자 부르기';

/** 07-4 화면을 바로 열었을 때(개발용 화면 목록 등) 보이는 받은 신호 */
export const mockIncomingSignal: IncomingSignal = {
  messageId: 'mock',
  isEmergency: false,
  isPractice: false,
  senderName: mockGuardian.name,
  signalName: findSignal('visitor')?.name ?? '누가 왔어',
  pulses: findSignal('visitor')?.pulses ?? [],
};
