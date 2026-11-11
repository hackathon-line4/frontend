import { useEffect } from 'react';

import { useSession } from '@/features/session';

import { restoreCalibration } from './persist';

/** 앱 시작 · 로그인 직후 내 진동 설정을 기기·서버 저장값으로 복원한다. 화면에는 아무것도 그리지 않는다 */
export function CalibrationSync() {
  const status = useSession().status;

  useEffect(() => {
    if (status === 'loading') return;
    void restoreCalibration();
  }, [status]);

  return null;
}
