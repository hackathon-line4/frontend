import { requireOptionalNativeModule } from 'expo';

// 전원 버튼 3번 → 잠금화면 위로 당사자 대기 화면(/recipient) 띄우기 (B-7).
// 띄우려면 '다른 앱 위에 표시' 권한이 있어야 한다. 당사자 폰 설정 안내 화면(B-9)에서 켜게 한다.
// 네이티브 모듈이 없는 곳(Expo Go·웹)에서는 권한이 없는 것으로 본다.

type SonullimNativeModule = {
  canDrawOverlays(): boolean;
  openOverlaySettings(): void;
};

const native = requireOptionalNativeModule<SonullimNativeModule>('SonullimNative');

export function canDrawOverlays(): boolean {
  return native?.canDrawOverlays() ?? false;
}

/** 설정 앱의 '다른 앱 위에 표시' 화면 (손울림 항목) 열기 */
export function openOverlaySettings() {
  native?.openOverlaySettings();
}
