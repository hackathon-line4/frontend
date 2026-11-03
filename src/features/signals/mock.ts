import type { Signal } from './types';

// 서버 연결 전 화면 확인용. 리듬은 자리 표시용 예시 (현장 촉신호 어휘·전문가 검증 후 확정)
export const mockSignals: readonly Signal[] = [
  { id: 'here', name: '나 여기 있어', icon: 'sig-person', source: 'basic', category: 'daily', beats: ['L', 'S'] },
  { id: 'meal', name: '밥 먹자', icon: 'sig-bowl', source: 'custom', category: 'daily', beats: ['S', 'S', 'S'] },
  {
    id: 'medicine',
    name: '약 먹을 시간',
    icon: 'sig-pill',
    source: 'custom',
    category: 'daily',
    beats: ['L', 'S', 'S'],
    untrained: true,
  },
  { id: 'go', name: '가자', icon: 'sig-arrow', source: 'basic', category: 'outing', beats: ['S', 'L', 'S'] },
  { id: 'wait', name: '기다려', icon: 'sig-clock', source: 'basic', category: 'outing', beats: ['L', 'L'] },
  { id: 'visitor', name: '누가 왔어', icon: 'sig-door', source: 'basic', category: 'outing', beats: ['S', 'S', 'L'] },
  { id: 'okay', name: '괜찮아?', icon: 'sig-question', source: 'basic', category: 'check', beats: ['S', 'S', 'L', 'S'] },
  { id: 'stop', name: '멈춰', icon: 'warning', source: 'basic', category: 'emergency', beats: ['L', 'L', 'L'] },
];

export function findSignal(id: string): Signal | undefined {
  return mockSignals.find((s) => s.id === id);
}
