import { requireOptionalNativeModule } from 'expo';

// 화면 켜두기. 네이티브 모듈이 없는 곳(Expo Go·웹)에서는 아무 일도 하지 않는다.

type SonullimNativeModule = {
  setKeepScreenOn(on: boolean): void;
};

const native = requireOptionalNativeModule<SonullimNativeModule>('SonullimNative');

/** 켜 두면 사용자가 터치하지 않아도 화면이 자동으로 꺼지지 않는다. 화면을 떠날 때 꼭 false로 해제 */
export function setKeepScreenOn(on: boolean) {
  native?.setKeepScreenOn?.(on);
}
