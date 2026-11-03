import { beatLabel, beatMs, type Beat } from '@/theme';

// 신호 추가에서 쓰는 리듬 계산. 길이는 theme의 beatMs(기기 검증 전 값)에서만 계산한다.

export const MIN_BEATS = 2;
export const MAX_BEATS = 5;

/** 박자 길이 합 + 박자 사이 간격 */
export function rhythmMs(beats: readonly Beat[]): number {
  if (beats.length === 0) return 0;
  return beats.reduce((sum, b) => sum + beatMs[b], 0) + beatMs.gap * (beats.length - 1);
}

/** '약 2.2초' · '약 2초' (소수 첫째 자리, .0은 뺀다) */
export function formatSeconds(ms: number): string {
  const s = Math.round(ms / 100) / 10;
  return `약 ${Number.isInteger(s) ? s.toFixed(0) : s.toFixed(1)}초`;
}

export function formatRhythmLength(beats: readonly Beat[]): string {
  return formatSeconds(rhythmMs(beats));
}

/** 박자 하나의 길이 (예: '0.2초') */
export function beatSeconds(beat: Beat): string {
  return `${beatMs[beat] / 1000}초`;
}

export function sameBeats(a: readonly Beat[], b: readonly Beat[]): boolean {
  return a.length === b.length && a.every((beat, i) => beat === b[i]);
}

/** 스크린리더 안내: '중간 추가, 3박자, 약 2.2초' */
export function beatAddedAnnouncement(beat: Beat, beats: readonly Beat[]): string {
  return `${beatLabel[beat]} 추가, ${beats.length}박자, ${formatRhythmLength(beats)}`;
}

/** 재생 시뮬레이션용: 각 박자가 시작되는 시각(ms)과 끝나는 시각 */
export function beatSchedule(beats: readonly Beat[]): { starts: number[]; end: number } {
  const starts: number[] = [];
  let t = 0;
  beats.forEach((b, i) => {
    starts.push(t);
    t += beatMs[b] + (i < beats.length - 1 ? beatMs.gap : 0);
  });
  return { starts, end: t };
}
