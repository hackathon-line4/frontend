import { useSyncExternalStore } from 'react';

import { toDateKey } from './date';
import { mockHistory } from './mock';
import type { HistoryRecord, SignalRecord } from './types';

// 기록 목록 스토어. 목록과 상세가 같은 값을 보도록 작은 외부 스토어로 둔다.
// TODO: 서버 기록 API로 교체 (날짜별 조회, 실시간 상태 갱신)

let records: readonly HistoryRecord[] = mockHistory;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getRecords() {
  return records;
}

export function useHistoryRecords(): readonly HistoryRecord[] {
  return useSyncExternalStore(subscribe, getRecords, getRecords);
}

export function useHistoryRecord(id: string | undefined): HistoryRecord | undefined {
  const all = useHistoryRecords();
  return id ? all.find((r) => r.id === id) : undefined;
}

/** 전송 실패한 신호를 다시 보낸다. 결과가 오기 전까지 '전송 요청 중' */
export function resendSignal(id: string) {
  // TODO: 신호 전송 API 호출 후 결과(ack)로 delivery 갱신
  records = records.map((r): HistoryRecord =>
    r.id === id && r.type === 'signal'
      ? ({ ...r, delivery: { kind: 'requesting' }, response: null } satisfies SignalRecord)
      : r,
  );
  listeners.forEach((l) => l());
}

/** 같은 신호를 새로 한 번 더 보낸다 (기록 상세의 '이 신호 다시 보내기') */
export function sendSignalAgain(id: string) {
  const source = records.find((r): r is SignalRecord => r.id === id && r.type === 'signal');
  if (!source) return;
  const now = new Date();
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
  // TODO: 신호 전송 API 호출. id는 서버가 정한다
  const next: SignalRecord = {
    ...source,
    id: `r-${now.getTime()}`,
    date: toDateKey(now),
    sentAt: time,
    delivery: { kind: 'requesting' },
    response: null,
    relatedHelpId: undefined,
  };
  records = [next, ...records];
  listeners.forEach((l) => l());
}
