import { router } from 'expo-router';

import type { Role } from '@/features/session';

// 06 진동 설정 흐름: 06-1 설정 → 06-2 테스트 → 06-3 느낌 확인 → 06-5 저장 / 06-4 다른 방법
// 06-2 → 06-3은 replace로 바꿔 끼워서 뒤로 가기가 테스트 화면으로 돌아오지 않게 한다.

/** 역할별 설정 화면 (저장 후 돌아갈 곳) */
export function settingsHref(role: Role | null) {
  return role === 'recipient' ? ('/recipient/settings' as const) : ('/guardian/settings' as const);
}

/** 06-1 위에 쌓인 화면을 닫고 06-2 테스트를 새로 연다 */
export function restartTest() {
  router.dismissTo('/calibration');
  router.push('/calibration/test');
}
