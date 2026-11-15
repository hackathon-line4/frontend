import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getSessionRevision, useSession } from '@/features/session/store';

import { registerDevice, resetDeviceRegistration } from './registerDevice';

/**
 * 로그인한 동안 이 기기의 푸시 토큰을 서버에 등록해 둔다 (B-8).
 * 앱이 앞으로 올 때마다 다시 확인한다. 토큰이 그대로면 요청하지 않는다.
 * 등록에 실패해도 앱 사용은 막지 않는다 (다음에 앱이 앞으로 올 때 다시 시도).
 */
export function PushRegistration() {
  const session = useSession();
  const revision = getSessionRevision();
  const userId = session.status === 'authenticated' && session.tokens && session.user ? session.user.id : null;

  useEffect(() => {
    resetDeviceRegistration();
    if (!userId) return;
    let controller: AbortController | undefined;
    const run = () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      registerDevice(userId, request.signal).catch((error: unknown) => {
        if (!request.signal.aborted) console.warn('[push] 기기 등록 실패', error);
      });
    };
    run();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') run();
    });
    return () => {
      controller?.abort();
      subscription.remove();
    };
  }, [userId, revision]);

  return null;
}
