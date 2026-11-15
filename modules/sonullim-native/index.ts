import { NativeModule, requireNativeModule } from 'expo';

export type BackgroundServiceState = {
  /** 지금 서비스가 돌고 있음 */
  running: boolean;
  /** 켜두기로 저장됨 (재부팅 후 다시 켜짐) */
  enabled: boolean;
  /** 서비스가 켜진 뒤 전원 버튼 3번이 감지된 횟수 (개발 확인용) */
  powerTriggers: number;
};

declare class SonullimNativeModule extends NativeModule {
  /** 세기(amplitude) 조절 지원 여부 */
  hasAmplitudeControl(): boolean;
  /** [쉼, 울림, 쉼, 울림, …] ms 시간표대로 1회 진동. amplitudes는 0~255, 쉼 칸은 0 */
  vibrateWaveform(timings: number[], amplitudes: number[]): void;
  cancelVibration(): void;

  startBackgroundService(): void;
  stopBackgroundService(): void;
  getBackgroundServiceState(): BackgroundServiceState;

  canDrawOverlays(): boolean;
  openOverlaySettings(): void;

  /** google-services.json이 들어간 빌드인지 */
  isPushConfigured(): boolean;
  /** FCM 토큰. 설정이 없거나 실패하면 null */
  getPushToken(): Promise<string | null>;
}

// Android 전용. Expo Go에는 없으므로 development build에서만 동작한다.
// 앱 코드는 이 파일 대신 src/native/를 쓴다
export default requireNativeModule<SonullimNativeModule>('SonullimNative');
