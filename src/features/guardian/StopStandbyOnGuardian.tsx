import { useEffect } from 'react';

import { getBackgroundServiceState, stopBackgroundService } from '@/native/background';

/**
 * 손울림 대기(포그라운드 서비스)는 당사자 전용이다. 같은 휴대폰에서 당사자로 쓰다가 보호자로 바꾸면
 * 서비스와 '손울림이 대기 중이에요' 알림이 남아 있으므로, 보호자 화면에 들어오면 꺼 준다.
 * 끈 상태는 저장돼 재부팅해도 다시 켜지지 않는다. 화면에는 아무것도 그리지 않는다.
 */
export function StopStandbyOnGuardian() {
  useEffect(() => {
    if (getBackgroundServiceState().enabled) stopBackgroundService();
  }, []);
  return null;
}
