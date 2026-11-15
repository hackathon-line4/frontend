import { useEffect } from 'react';

import { useSession } from '@/features/session';
import { getSessionRevision } from '@/features/session/store';

import { restoreCalibration } from './persist';

/** 앱 시작 · 로그인 직후 내 진동 설정을 기기·서버 저장값으로 복원한다. 화면에는 아무것도 그리지 않는다 */
export function CalibrationSync() {
  const { status, user } = useSession();
  const userId = user?.id;
  const revision = getSessionRevision();

  useEffect(() => {
    const controller = new AbortController();
    void restoreCalibration(controller.signal);
    return () => controller.abort();
  }, [status, userId, revision]);

  return null;
}
