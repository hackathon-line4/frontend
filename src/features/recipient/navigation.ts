import { router } from 'expo-router';

/** 07-1 대기 화면으로 돌아가기 (위에 쌓인 상태 화면을 닫는다) */
export function backToIdle() {
  router.dismissTo('/recipient');
}
