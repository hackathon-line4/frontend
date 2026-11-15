import { mockGuardian } from '@/features/link/mock';
import { findSignal } from '@/features/signals';

import type { IncomingSignal } from './incoming';

// 로그인하지 않은 개발용 화면 미리보기 데이터. 실제 전송/응답을 성공 처리하지 않는다.

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
