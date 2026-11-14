import { randomUUID } from 'expo-crypto';

import { attachHelpLocation, helpLocationStatus } from '@/features/location/recipient';
import { getSession, getSessionRevision } from '@/features/session/store';
import { playFeedback } from '@/features/vibration';
import { recipientApi } from './api';
import { createRecipientSender } from './sender';

const send = createRecipientSender({
  api: recipientApi, createKey: randomUUID, feedback: playFeedback,
  extraBody: (kind) => (kind === 'help' ? { locationStatus: helpLocationStatus() } : {}),
  onCreated: (kind, created) => {
    if (kind === 'help' && created.locationStatus === 'PENDING') void attachHelpLocation(created.id);
  },
  context: () => {
    const session = getSession();
    const link = session.links.find((item) => item.status === 'ACTIVE' && item.recipient.id === session.user?.id);
    if (!session.tokens || session.status !== 'authenticated' || session.role !== 'recipient' || !link) return null;
    return { owner: `${session.user?.id}:${getSessionRevision()}`, linkId: link.id };
  },
});

/** 07-1 한 번 탭: 전송 없음. 연결 상태 확인 진동만 */
export function playConnectionCheck() {
  playFeedback('connection');
}

/** 3초 길게 누르는 동안 1초마다 짧은 진동 (3초째는 requestHelp의 확인 진동) */
export function playHelpCountdown() {
  playFeedback('countdown');
}

/** 3초 길게 누르기: 도움 요청 */
export function requestHelp(signal?: AbortSignal) {
  return send('help', signal);
}

/**
 * 07-2 신호 보내기. 서버가 전송 요청을 받았다고 확인하면 true.
 * 실패하면 false → '보냄'을 표시하지 않고 07-2 유지
 */
export function sendSignal(signal?: AbortSignal) {
  return send('call', signal);
}
