import { mockRecipient } from '@/features/link/mock';

import type { Activity, NoReplyRecord, RecipientLocation, RecipientStatus } from './types';

// 서버 연결 전 화면 확인용 데이터
// TODO: 당사자 상태 · 최근 활동 · 위치는 서버(실시간 구독)에서 받아 온다.

export const mockRecipientStatus: RecipientStatus = {
  name: mockRecipient.name,
  connected: true,
  lastReply: { label: '알겠어', minutesAgo: 3 },
  waitMinutes: 10,
};

/** 응답 대기 시간을 넘긴 상태 (주의 카드 확인용) */
export const mockRecipientStatusNoReply: RecipientStatus = {
  ...mockRecipientStatus,
  pendingMinutes: 12,
};

/** 홈 '자주 쓰는 신호' 2×3 (mockSignals id) */
export const mockFrequentSignalIds = ['visitor', 'here', 'go', 'wait', 'meal', 'medicine'] as const;

export const mockRecentActivity: readonly Activity[] = [
  { id: 'r-1847', signalName: '나 여기 있어', sentAt: '18:47', status: 'replied' },
  { id: 'r-1831', signalName: '기다려', sentAt: '18:31', status: 'delivered' },
  { id: 'r-1620', signalName: '가자', sentAt: '16:20', status: 'failed' },
];

export const mockLocation: RecipientLocation = {
  sharing: true,
  updatedAt: '18:51',
  minutesAgo: 3,
  address: '[주소]',
  addressSummary: '[주소 요약]',
  accuracyMeters: 0, // TODO: 실제 정확도. 0이면 '[N]'으로 표시
};

export const mockNoReplyRecord: NoReplyRecord = {
  id: 'r-1802',
  signalId: 'go',
  signalName: '가자',
  recipientName: mockRecipient.name,
  sentAtLabel: '오후 6:02',
  steps: [
    { label: '보냄', time: '6:02', done: true },
    { label: '기기에 도착', time: '6:02', done: true },
    { label: '진동 재생됨', detail: '3번 반복 · 기기가 알려 준 기록', time: '6:02', done: true },
    { label: '화면 터치 없음', detail: '10분 동안 응답이 확인되지 않았어요', time: '6:12', done: false },
  ],
};
