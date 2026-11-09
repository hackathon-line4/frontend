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

// 박자 길이는 촉신호 → 진동 변환 규칙의 단위에 맞춘다 (촉신호 선별 문서 4-3).
// 짧게 = 두드림 150 · 중간 = 획 700 · 길게 = 큰 획 1000 · 박자 사이 = 손 뗌 150.
// 직접 조합하기(10-5)도 같은 단위를 써서 기본 신호와 감각을 맞춘다.
// 실기기에서 너무 약하면 두드림(S)만 올린다 (예: 200).
export const beatMs = { S: 150, M: 700, L: 1000, gap: 150 } as const;

export function describeRhythm(beats: readonly Beat[]): string {
  return beats.map((b) => beatLabel[b]).join(' ');
}

/**
 * 진동 배열. [울림, 쉼, 울림, …] ms, 첫 값은 울림 (서버와 주고받는 형식).
 * 안드로이드에 넘길 때만 앞에 대기 0을 붙인다 (features/vibration).
 */
export type Pulses = readonly number[];

/** 직접 조합한 박자 → 진동 배열 */
export function beatsToPulses(beats: readonly Beat[]): Pulses {
  return beats.flatMap((b, i) => (i === 0 ? [beatMs[b]] : [beatMs.gap, beatMs[b]]));
}

/** 진동 배열 → 그림·읽기용 박자 (울림 하나당 박자 하나). 길이로 짧게/중간/길게를 고른다 */
export function pulsesToBeats(pulses: Pulses): Beat[] {
  return pulses
    .filter((_, i) => i % 2 === 0)
    .map((ms) => (ms <= beatMs.S + 50 ? 'S' : ms < beatMs.L ? 'M' : 'L'));
}

/** 진동 배열 전체 길이 (ms) */
export function pulsesMs(pulses: Pulses): number {
  return pulses.reduce((sum, ms) => sum + ms, 0);
}

export function samePulses(a: Pulses, b: Pulses): boolean {
  return a.length === b.length && a.every((ms, i) => ms === b[i]);
}
