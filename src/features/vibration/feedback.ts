import type { Waveform } from '@/native/vibration';

// 당사자 확인 진동 5종 (B-4). 신호 리듬과 헷갈리지 않게 따로 만든다.
// 패턴은 기기에서 둘이 같이 느껴보고 확정 (지금은 placeholder).
// 세기 보정만 적용하고 길이는 고정한다 (서로 구분되는 게 더 중요).

export type FeedbackKind =
  /** 07-1 한 번 탭: 연결 상태 확인 */
  | 'connection'
  /** 신호·도움 요청을 서버가 받음 */
  | 'sent'
  /** 전송 실패 */
  | 'failed'
  /** 3초 길게 누르는 동안 1초마다 */
  | 'countdown'
  /** 전원 버튼 3번으로 앱이 켜짐 */
  | 'launched';

/** [울림, 쉼, 울림, …] ms. 앞의 0(시작 대기)은 feedbackWaveform에서 붙인다 */
const patterns: Record<FeedbackKind, readonly number[]> = {
  connection: [80],
  sent: [120, 120, 120],
  failed: [600, 200, 600],
  countdown: [60],
  launched: [300, 150, 80, 150, 80],
};

export function feedbackWaveform(kind: FeedbackKind, amplitude: number): Waveform {
  const steps = patterns[kind];
  return {
    timings: [0, ...steps],
    amplitudes: [0, ...steps.map((_, i) => (i % 2 === 0 ? amplitude : 0))],
  };
}
