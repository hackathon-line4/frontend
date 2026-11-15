import type { IconName } from '@/components/Icon';

import type { DeliveryState, HistoryRecord, HistoryFilter, ResponseState, SignalRecord } from './types';

// 기록 상태 문구. 시간만 객관적으로 적고 위험·이상 징후 같은 해석을 붙이지 않는다.
// '읽음', '이해함', '확인함'은 당사자 쪽에 쓰지 않는다.

export type StatusText = { icon: IconName | null; text: string; strong: boolean };

/** 'HH:MM:SS' → 'HH:MM' */
export function hhmm(time: string): string {
  return time.slice(0, 5);
}

/** 초 → '3분 6초' / '3분' / '40초' */
export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}초`;
  return s === 0 ? `${m}분` : `${m}분 ${s}초`;
}

/** 받침에 맞는 주격 조사: '김하늘이', '이영희가' */
export function withSubject(name: string): string {
  const code = name.charCodeAt(name.length - 1) - 0xac00;
  const hasBatchim = code >= 0 && code <= 11171 && code % 28 !== 0;
  return `${name}${hasBatchim ? '이' : '가'}`;
}

export function deliveryStatus(delivery: DeliveryState): StatusText {
  switch (delivery.kind) {
    case 'requesting':
      return { icon: 'pending', text: '전송 요청 중', strong: true };
    case 'failed':
      return { icon: 'warning', text: `전송 실패 · ${delivery.reason}`, strong: true };
    case 'delivered':
      return { icon: 'device-check', text: `전달 완료 · ${hhmm(delivery.at)}`, strong: false };
    case 'unknown':
      return { icon: 'sig-question', text: '전달 확인 안 됨', strong: true };
  }
}

/** 응답 상태가 없을 때(전달 전·전송 실패)는 이유만 적는다 */
export function responseStatus(record: SignalRecord): StatusText {
  const { response, delivery } = record;
  if (!response) {
    return {
      icon: null,
      text:
        delivery.kind === 'failed' ? '전송되지 않아 응답을 받을 수 없었어요' : '기기에 전달된 뒤부터 기록돼요',
      strong: false,
    };
  }
  return responseStateStatus(response);
}

export function responseStateStatus(response: ResponseState): StatusText {
  switch (response.kind) {
    case 'waiting':
      return { icon: 'waiting', text: `응답 대기 중 · 전달 후 ${response.elapsedMin}분`, strong: true };
    case 'replied':
      return {
        icon: 'replied',
        text: `응답 완료 · ${hhmm(response.at)} (전달 후 ${formatDuration(response.afterSec < 60 ? response.afterSec : response.afterSec - (response.afterSec % 60))})`,
        strong: true,
      };
    case 'noReply':
      return { icon: 'no-reply-dashed', text: `응답 없음 · ${response.waitMin}분 동안 터치 없음`, strong: true };
  }
}

export function isNoReply(record: HistoryRecord): boolean {
  return record.type === 'signal' && record.response?.kind === 'noReply';
}

export function matchesFilter(record: HistoryRecord, filter: HistoryFilter): boolean {
  return filter === 'all' || isNoReply(record);
}
