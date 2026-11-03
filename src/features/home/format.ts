import { beatMs, type Beat } from '@/theme';

/** '3분 전' · 0분이면 '방금' */
export function minutesAgoLabel(minutes: number): string {
  return minutes <= 0 ? '방금' : `${minutes}분 전`;
}

/** 리듬 전체 길이 (초, 소수 한 자리). beatMs는 기기 검증 전 값 */
export function rhythmSeconds(beats: readonly Beat[]): string {
  if (beats.length === 0) return '0';
  const ms = beats.reduce((sum, b) => sum + beatMs[b], 0) + beatMs.gap * (beats.length - 1);
  return (Math.round(ms / 100) / 10).toString();
}

/** 응답 대기 시간을 넘겼는지 */
export function isOverdue(pendingMinutes: number | undefined, waitMinutes: number): boolean {
  return pendingMinutes !== undefined && pendingMinutes >= waitMinutes;
}
