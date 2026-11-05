import { requireOptionalNativeModule } from 'expo';

// 진동 네이티브 함수 (C-1 계약). 화면·기능 코드는 modules/를 직접 부르지 말고 여기만 쓴다.
// Expo Go·웹처럼 네이티브 모듈이 없는 곳에서는 아무 일도 하지 않는다 (앱이 죽지 않게).

/** 네이티브에 넘기는 진동 시간표. timings는 [쉼, 울림, 쉼, 울림, …] ms, amplitudes는 같은 길이의 0~255 */
export type Waveform = {
  timings: number[];
  amplitudes: number[];
};

export type VibrationCapability = {
  /** 네이티브 진동 모듈 사용 가능 (development build / APK) */
  available: boolean;
  /** 세기 조절 지원. false면 길이만 구분된다 */
  amplitudeControl: boolean;
};

type SonullimNativeModule = {
  hasAmplitudeControl(): boolean;
  vibrateWaveform(timings: number[], amplitudes: number[]): void;
  cancelVibration(): void;
};

const native = requireOptionalNativeModule<SonullimNativeModule>('SonullimNative');

let capability: VibrationCapability | undefined;

export function getVibrationCapability(): VibrationCapability {
  if (!capability) {
    capability = {
      available: native != null,
      amplitudeControl: native?.hasAmplitudeControl() ?? false,
    };
  }
  return capability;
}

/** 시간표대로 1회 재생. 이미 울리는 진동은 끊고 새로 시작한다 */
export function playWaveform({ timings, amplitudes }: Waveform) {
  if (!native || timings.length === 0) return;
  native.vibrateWaveform(timings, amplitudes);
}

export function stopVibration() {
  native?.cancelVibration();
}
