import { NativeModule, requireNativeModule } from 'expo';

declare class SonullimNativeModule extends NativeModule {
  /** 세기(amplitude) 조절 지원 여부 */
  hasAmplitudeControl(): boolean;
  /** [쉼, 울림, 쉼, 울림, …] ms 시간표대로 1회 진동. amplitudes는 0~255, 쉼 칸은 0 */
  vibrateWaveform(timings: number[], amplitudes: number[]): void;
  cancelVibration(): void;
}

// Android 전용. Expo Go에는 없으므로 development build에서만 동작한다
export default requireNativeModule<SonullimNativeModule>('SonullimNative');
