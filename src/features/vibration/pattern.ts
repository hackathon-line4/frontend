import type { CalibrationValues } from '@/features/calibration/store';
import type { Waveform } from '@/native/vibration';
import { beatsToPulses, type Beat, type Pulses } from '@/theme';

// 리듬(S·M·L) + 내 진동 설정(보정값) → 네이티브 진동 시간표.
// 보정값은 모든 신호에 같은 비율로 적용한다. 리듬의 순서·구성(신호의 뜻)은 바꾸지 않는다.
// 아래 숫자는 기기 검증 전 값 (placeholder).

/** 세기 1~3단계 → 진동 세기 (0~255) */
export const strengthAmplitude = [90, 170, 255] as const;

/** 길이 1~3단계 → 박자 길이 배율. 박자 사이 간격에도 같이 적용 */
export const lengthScale = [0.7, 1, 1.5] as const;

/** 반복할 때 한 번 끝나고 다음 시작까지 쉬는 시간 */
export const REPEAT_GAP_MS = 1500;

function pick<T>(list: readonly T[], level: number): T {
  return list[Math.min(list.length, Math.max(1, level)) - 1];
}

/**
 * 진동 배열 1개를 보정값대로 시간표로 바꾼다. repeat번 반복해서 이어 붙인다.
 * 길이 배율은 울림·쉼 모두에 같이 적용한다 (신호 안의 비율은 그대로).
 * 결과: timings = [0, 울림, 쉼, 울림, …], amplitudes는 울림 칸만 세기 값
 */
export function pulsesWaveform(pulses: Pulses, values: CalibrationValues): Waveform {
  const timings: number[] = [];
  const amplitudes: number[] = [];
  if (pulses.length === 0) return { timings, amplitudes };

  const scale = pick(lengthScale, values.length);
  const amplitude = pick(strengthAmplitude, values.strength);
  const repeat = Math.max(1, values.repeat);

  timings.push(0);
  amplitudes.push(0);
  for (let r = 0; r < repeat; r++) {
    if (r > 0) {
      timings.push(REPEAT_GAP_MS);
      amplitudes.push(0);
    }
    pulses.forEach((ms, i) => {
      timings.push(Math.round(ms * scale));
      amplitudes.push(i % 2 === 0 ? amplitude : 0);
    });
  }
  return { timings, amplitudes };
}

/** 박자(S·M·L)로 된 리듬을 보정값대로 시간표로 (06 테스트 신호 등) */
export function rhythmWaveform(beats: readonly Beat[], values: CalibrationValues): Waveform {
  return pulsesWaveform(beatsToPulses(beats), values);
}

/** 시간표 전체 길이 (ms). 화면에서 '재생 중' 표시를 끝낼 때 쓴다 */
export function waveformMs({ timings }: Waveform): number {
  return timings.reduce((sum, ms) => sum + ms, 0);
}
