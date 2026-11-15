import { device, ranges, type CalibrationKey, type CalibrationValues } from './store';

export const calibrationTitle: Record<CalibrationKey, string> = {
  strength: '세기',
  length: '길이',
  repeat: '반복',
};

const levelWords: Record<'strength' | 'length', readonly string[]> = {
  strength: ['약하게', '보통', '강하게'],
  length: ['짧게', '보통', '길게'],
};

/** 단계값 이름 (예: 강하게 · 보통 · 2번) */
export function valueLabel(key: CalibrationKey, value: number): string {
  if (key === 'repeat') return `${value}번`;
  const words = levelWords[key];
  // 단계 수가 3이 아니면 (기기 확인 후) 단계 번호로 표시
  if (ranges[key].max !== words.length) return `${value}단계`;
  return words[value - 1] ?? `${value}단계`;
}

/** 값 아래 보조 글자 (예: 3단계 중 3 · 신호를 2번 들려줘요) */
export function valueCaption(key: CalibrationKey, value: number): string {
  if (key === 'repeat') return `신호를 ${value}번 들려줘요`;
  return `${ranges[key].max}단계 중 ${value}`;
}

/** 세기 강하게 · 길이 보통 · 반복 2번 (세기 조절 미지원 기기는 세기 생략) */
export function summarize(values: CalibrationValues): string {
  const keys: CalibrationKey[] = device.strengthSupported ? ['strength', 'length'] : ['length'];
  return keys.map((key) => `${calibrationTitle[key]} ${valueLabel(key, values[key])}`).join(' · ');
}
