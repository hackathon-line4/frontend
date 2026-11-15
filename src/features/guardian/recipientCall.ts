import { useSyncExternalStore } from 'react';
import { Vibration } from 'react-native';

import { guardianApi, guardianStore } from './client';

// 보호자 앱이 열려 있을 때 당사자의 '보호자 부르기'를 받으면 (SSE recipient_signal.created):
// 1) 받았다는 기록(DELIVERED)을 바로 보내고  2) 진동 + 앱 안 알림 창(RecipientCallAlert)으로 알린다.
// 앱이 꺼져 있을 때는 FCM 알림(GuardianNotifier)이 같은 역할을 한다.

export type RecipientCall = { id: string; senderName: string | null };

/** SSE 재연결 때 같은 이벤트가 다시 와도 한 번만 알린다 */
const announced = new Set<string>();
let current: RecipientCall | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getCurrent = () => current;

/** 지금 띄울 보호자 부르기 (없으면 null) */
export function useRecipientCall(): RecipientCall | null {
  return useSyncExternalStore(subscribe, getCurrent, getCurrent);
}

export function dismissRecipientCall() {
  current = null;
  emit();
}

export function announceRecipientCall(call: RecipientCall, signal?: AbortSignal) {
  if (announced.has(call.id)) return;
  announced.add(call.id);
  if (announced.size > 100) announced.delete(announced.values().next().value!);

  void guardianApi.receiveCall(call.id, signal).then(() => guardianStore.loadHome(true)).catch(() => {});

  Vibration.vibrate([0, 300, 150, 300]);
  // 여러 번 오면 가장 최근 것 하나만 보여 준다 (나머지는 기록에 남음)
  current = call;
  emit();
}
