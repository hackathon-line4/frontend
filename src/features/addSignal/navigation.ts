import { router } from 'expo-router';

import { getAddSignalState, type AddSignalOrigin } from './store';

// 신호 추가를 끝내거나 닫으면 시작한 곳(홈 또는 신호 탭)으로 돌아간다.
const originHref = {
  home: '/guardian',
  signals: '/guardian/signals',
} as const satisfies Record<AddSignalOrigin, string>;

export function exitAddSignal() {
  router.dismissTo(originHref[getAddSignalState().origin]);
}

/** 단계 뒤로. 화면을 바로 열어 뒤가 없으면 흐름을 닫는다 */
export function backInAddSignal() {
  if (router.canGoBack()) router.back();
  else exitAddSignal();
}
