import { useSyncExternalStore } from 'react';

import {
  mockConnection,
  mockGuardianSettings,
  mockLocationPermission,
  mockNotificationPermission,
  mockRecipientSettings,
} from './mock';
import type {
  ConnectionState,
  GuardianSettings,
  LocationPermission,
  NotificationPermission,
  RecipientSettings,
} from './types';

// 설정 스토어. 설정 화면과 연결 도움말 화면이 같은 값을 보도록 작은 외부 스토어로 둔다.
// TODO: 서버 설정 API · 운영체제 권한 값으로 교체

type SettingsState = {
  connection: ConnectionState;
  /** 연결 확인 요청을 보내고 응답(ack)을 기다리는 중 */
  checking: boolean;
  guardian: GuardianSettings;
  recipient: RecipientSettings;
  locationPermission: LocationPermission;
  notificationPermission: NotificationPermission;
};

let state: SettingsState = {
  connection: mockConnection,
  checking: false,
  guardian: mockGuardianSettings,
  recipient: mockRecipientSettings,
  locationPermission: mockLocationPermission,
  notificationPermission: mockNotificationPermission,
};

const listeners = new Set<() => void>();

function set(next: Partial<SettingsState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getState() {
  return state;
}

export function useSettings(): SettingsState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function updateGuardianSettings(patch: Partial<GuardianSettings>) {
  set({ guardian: { ...state.guardian, ...patch } });
}

export function updateRecipientSettings(patch: Partial<RecipientSettings>) {
  set({ recipient: { ...state.recipient, ...patch } });
}

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * 지금 연결 확인하기. 상대 앱에 확인 요청을 보내고 응답(ack)이 오면 연결됨.
 * 보호자가 확인할 때 당사자 쪽에는 진동이나 화면 변화를 만들지 않는다.
 */
export function checkConnection() {
  if (state.checking) return;
  set({ checking: true });
  // TODO: 연결 확인 API. 응답이 없으면 status 'unconfirmed' + 마지막 확인 시각 유지
  setTimeout(() => {
    set({ checking: false, connection: { ...state.connection, status: 'connected', lastCheckedAt: nowHHMM() } });
  }, 1200);
}
