import { requireOptionalNativeModule } from 'expo';

// FCM 푸시 (B-8). 앱이 꺼져 있을 때 신호를 받으면 네이티브(SonullimMessagingService)가 당사자 화면을 띄운다.
// JS는 이 기기의 토큰을 서버에 등록하기만 한다.
// google-services.json 없이 빌드했거나 네이티브 모듈이 없는 곳(Expo Go·웹)에서는 토큰이 없다.

type SonullimNativeModule = {
  isPushConfigured(): boolean;
  getPushToken(): Promise<string | null>;
};

const native = requireOptionalNativeModule<SonullimNativeModule>('SonullimNative');

/** google-services.json이 들어간 빌드인지 */
export function isPushConfigured(): boolean {
  return native?.isPushConfigured() ?? false;
}

/** 이 기기의 FCM 토큰. 없으면 null */
export async function getPushToken(): Promise<string | null> {
  if (!native) return null;
  try {
    return await native.getPushToken();
  } catch {
    return null;
  }
}
