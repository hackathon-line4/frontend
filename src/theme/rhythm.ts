// 진동 리듬 표기. S(짧게) = 점, M(중간) = 짧은 선, L(길게) = 긴 선.
// 진동 패턴은 신호 사전(Signal registry)의 데이터에서만 만든다. 임의로 만들지 않음.

export type Beat = 'S' | 'M' | 'L';

export const beatLabel: Record<Beat, string> = {
  S: '짧게',
  M: '중간',
  L: '길게',
};

export const rhythmSize = {
  sm: { height: 9, S: 9, M: 16, L: 26, gap: 5 },
  md: { height: 13, S: 13, M: 22, L: 38, gap: 6 },
  lg: { height: 20, S: 20, M: 34, L: 58, gap: 10 },
} as const;

export type RhythmSize = keyof typeof rhythmSize;

// 아직 기기 검증 전 값 (placeholder). 확인·실패 진동도 검증 후 확정.
export const beatMs = { S: 200, M: 500, L: 900, gap: 300 } as const;

export function describeRhythm(beats: readonly Beat[]): string {
  return beats.map((b) => beatLabel[b]).join(' ');
}
