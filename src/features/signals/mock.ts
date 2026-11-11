import { beatsToPulses, pulsesToBeats, type Beat, type Pulses } from '@/theme';

import type { Signal } from './types';

// 서버 연결 전 화면 확인용.

/**
 * 촉신호 변환 규칙으로 만든 진동 배열 (촉신호 선별 문서 4-5). [울림, 쉼, …] ms.
 * 한국 촉신호99 동작 설명을 받으면 같은 규칙으로 다시 변환한다.
 */
export const tactilePulses = {
  /** 🇩🇰 Hello: 팔꿈치 뒤를 두 번 두드림 → 두드림 ×2 */
  here: [150, 150, 150],
  /** 🇰🇷 오다: 걷기 → (전환) → 당기는 획 */
  visitor: [150, 150, 150, 150, 150, 150, 150, 500, 700],
  /** 🇩🇰 Eating/Food: 위팔에 원 하나 → 획 ×1 */
  meal: [700],
  /** 🇩🇰 Leaving: 두 손가락으로 등을 걸어서 가로지름 → 걷기 */
  go: [150, 150, 150, 150, 150, 150, 150],
  /** 🇩🇰 Moment/Waiting: 위팔을 앞뒤로 문지름 → 왕복 */
  wait: [350, 50, 350, 50, 350, 50, 350],
  /** 🇩🇰 Danger · 🇰🇷 응급: 큰 X (큰 획 ×2) → 강조 ×3 */
  danger: [1000, 150, 1000, 500, 1000, 150, 1000, 500, 1000, 150, 1000],
} as const satisfies Record<string, Pulses>;

/** 촉신호에서 온 신호: 진동 배열이 원본, 그림용 박자는 여기서 만든다 */
export function fromPulses(pulses: Pulses): Pick<Signal, 'pulses' | 'beats'> {
  return { pulses, beats: pulsesToBeats(pulses) };
}

/** 박자로 만든 신호 (직접 조합 · 촉신호 원문이 아직 없는 자리 표시용) */
export function fromBeats(beats: readonly Beat[]): Pick<Signal, 'pulses' | 'beats'> {
  return { pulses: beatsToPulses(beats), beats };
}

export const mockSignals: readonly Signal[] = [
  { id: 'here', name: '나 여기 있어', icon: 'sig-person', source: 'basic', category: 'daily', ...fromPulses(tactilePulses.here) },
  { id: 'meal', name: '밥 먹자', icon: 'sig-bowl', source: 'basic', category: 'daily', ...fromPulses(tactilePulses.meal) },
  {
    id: 'medicine',
    name: '약 먹을 시간',
    icon: 'sig-pill',
    source: 'custom',
    category: 'daily',
    ...fromBeats(['L', 'S', 'S']),
    untrained: true,
  },
  { id: 'go', name: '가자', icon: 'sig-arrow', source: 'basic', category: 'outing', ...fromPulses(tactilePulses.go) },
  { id: 'wait', name: '기다려', icon: 'sig-clock', source: 'basic', category: 'outing', ...fromPulses(tactilePulses.wait) },
  { id: 'visitor', name: '누가 왔어', icon: 'sig-door', source: 'basic', category: 'outing', ...fromPulses(tactilePulses.visitor) },
  // 촉신호 원문 미확보 → 박자로 자리 표시
  { id: 'okay', name: '괜찮아?', icon: 'sig-question', source: 'basic', category: 'check', ...fromBeats(['S', 'S', 'L', 'S']) },
  { id: 'danger', name: '위험해', icon: 'warning', source: 'basic', category: 'emergency', ...fromPulses(tactilePulses.danger) },
];

export function findSignal(id: string): Signal | undefined {
  return mockSignals.find((s) => s.id === id);
}
