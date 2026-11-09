import { pulsesMs, type Pulses } from '@/theme';

/** '3분 전' · 0분이면 '방금' */
export function minutesAgoLabel(minutes: number): string {
  return minutes <= 0 ? '방금' : `${minutes}분 전`;
}

/** 리듬 전체 길이 (초, 소수 한 자리). 진동 배열에서 계산 */
export function rhythmSeconds(pulses: Pulses): string {
  return (Math.round(pulsesMs(pulses) / 100) / 10).toString();
}

/** 응답 대기 시간을 넘겼는지 */
export function isOverdue(pendingMinutes: number | undefined, waitMinutes: number): boolean {
  return pendingMinutes !== undefined && pendingMinutes >= waitMinutes;
}
