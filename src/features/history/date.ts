// 기록 날짜 계산 (기기 시간대 기준)

const weekdays = ['일', '월', '화', '수', '목', '금', '토'] as const;

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Date → 'YYYY-MM-DD' */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 'YYYY-MM-DD' → 그 날 0시 Date */
export function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayKey(): string {
  return toDateKey(new Date());
}

/** 날짜 키를 n일 옮긴다 */
export function shiftDateKey(key: string, days: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

/** '10월 26일 (월)' */
export function formatDateLabel(key: string): string {
  const date = fromDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${weekdays[date.getDay()]})`;
}

/** 스크린리더용 '10월 26일 월요일' */
export function formatDateSpoken(key: string): string {
  const date = fromDateKey(key);
  return `${date.getMonth() + 1}월 ${date.getDate()}일 ${weekdays[date.getDay()]}요일`;
}
