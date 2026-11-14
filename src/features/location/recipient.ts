import { useEffect, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { getSession } from '@/features/session/store';
import type { LocationPermission } from '@/features/settings/types';
import { locationApi } from './api';
import { askPermission, captureOnce, lastPermission, readPermission } from './device';

// 당사자 쪽 위치 공유.
// - 공유 켜기/끄기는 서버 값(/me/location-sharing)이다. 서버 기본값은 꺼짐.
// - 위치는 두 경우에만 한 번씩 잰다: 도움 요청을 보낼 때, 보호자가 위치를 확인할 때(앱이 켜져 있을 때).
// - 앱이 꺼져 있을 때도 답하려면 '항상 허용'이 필요하다. 공유를 켤 때 함께 묻는다.

type SharingState = { enabled: boolean | null; permission: LocationPermission; saving: boolean };

let state: SharingState = { enabled: null, permission: 'denied', saving: false };
const listeners = new Set<() => void>();

function set(next: Partial<SharingState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

const isRecipient = () => {
  const s = getSession();
  return s.status === 'authenticated' && s.role === 'recipient' && !!s.tokens;
};

/** 서버 공유 값과 휴대폰 권한을 다시 읽는다 */
export async function loadLocationSharing() {
  set({ permission: await readPermission() });
  if (!isRecipient()) return;
  try {
    set({ enabled: await locationApi.sharing() });
  } catch {
    // 화면은 마지막 값을 유지
  }
}

/** 설정의 '도움 요청에 위치 보내기'. 켤 때 권한이 없으면 먼저 묻는다 */
export async function setLocationSharing(enabled: boolean) {
  if (state.saving) return;
  const previous = state.enabled;
  set({ enabled, saving: true });
  try {
    if (enabled && lastPermission() !== 'granted') set({ permission: await askPermission() });
    set({ enabled: await locationApi.setSharing(enabled) });
  } catch {
    set({ enabled: previous });
  } finally {
    set({ saving: false });
  }
}

export function useLocationSharing(): SharingState {
  const snapshot = useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => state,
    () => state,
  );
  // 앱이 앞으로 올 때마다 권한을 다시 확인 (휴대폰 설정에서 바꾸고 돌아온 경우)
  useEffect(() => {
    void loadLocationSharing();
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') void loadLocationSharing(); });
    return () => sub.remove();
  }, []);
  return snapshot;
}

/**
 * 도움 요청을 만들 때 보낼 위치 상태. 위치를 기다리지 않고 요청을 먼저 보낸다.
 * 권한이 있으면 PENDING으로 보내고 attachHelpLocation으로 나중에 붙인다.
 * 공유가 꺼져 있으면 서버가 NOT_SHARED로 바꾼다.
 */
export function helpLocationStatus(): 'PENDING' | 'UNAVAILABLE' {
  return lastPermission() === 'denied' ? 'UNAVAILABLE' : 'PENDING';
}

export async function attachHelpLocation(helpRequestId: string) {
  try {
    await locationApi.attachToHelp(helpRequestId, await captureOnce());
  } catch {
    // 위치 없이도 도움 요청은 이미 도착했다
  }
}

const answered = new Set<string>();

/**
 * 보호자의 위치 확인 요청에 한 번 답한다.
 * 앱이 켜져 있으면 실시간 이벤트로, 꺼져 있으면 푸시 → 백그라운드 작업(src/headless.ts)으로 불린다.
 */
export async function answerLocationRequest(requestId: string, options: { background?: boolean } = {}) {
  if (!requestId || answered.has(requestId) || !isRecipient()) return;
  answered.add(requestId);
  try {
    await locationApi.fulfill(requestId, await captureOnce(options));
  } catch {
    answered.delete(requestId);
  }
}

// 앱이 켜질 때 한 번 권한을 읽어 둔다 (도움 요청 직전에 기다리지 않도록)
void readPermission();
