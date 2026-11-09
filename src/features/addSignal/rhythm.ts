import { beatLabel, beatMs, beatsToPulses, pulsesMs, type Beat, type Pulses } from '@/theme';

// 신호 추가에서 쓰는 리듬 계산. 길이는 진동 배열(pulses)에서만 계산한다.

export const MIN_BEATS = 2;
export const MAX_BEATS = 5;

/** '약 2.2초' · '약 2초' (소수 첫째 자리, .0은 뺀다) */
export function formatSeconds(ms: number): string {
  const s = Math.round(ms / 100) / 10;
  return `약 ${Number.isInteger(s) ? s.toFixed(0) : s.toFixed(1)}초`;
}

export function formatRhythmLength(pulses: Pulses): string {
  return formatSeconds(pulsesMs(pulses));
}

/** 직접 조합 중인 박자의 길이 */
export function formatBeatsLength(beats: readonly Beat[]): string {
  return formatRhythmLength(beatsToPulses(beats));
}

/** 박자 하나의 길이 (예: '0.15초') */
export function beatSeconds(beat: Beat): string {
  return `${beatMs[beat] / 1000}초`;
}

export function sameBeats(a: readonly Beat[], b: readonly Beat[]): boolean {
  return a.length === b.length && a.every((beat, i) => beat === b[i]);
}

/** 스크린리더 안내: '중간 추가, 3박자, 약 2.2초' */
export function beatAddedAnnouncement(beat: Beat, beats: readonly Beat[]): string {
  return `${beatLabel[beat]} 추가, ${beats.length}박자, ${formatBeatsLength(beats)}`;
}

/** 재생 표시용: 각 울림이 시작되는 시각(ms)과 끝나는 시각. 울림 하나 = 그림의 박자 하나 */
export function beatSchedule(pulses: Pulses): { starts: number[]; end: number } {
  const starts: number[] = [];
  let t = 0;
  pulses.forEach((ms, i) => {
    if (i % 2 === 0) starts.push(t);
    t += ms;
  });
  return { starts, end: t };
}
