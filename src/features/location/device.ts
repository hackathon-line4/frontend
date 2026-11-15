import * as Location from 'expo-location';

import type { LocationPermission } from '@/features/settings/types';

/** 서버로 보내는 위치 한 점 (위치 보내기 · 도움 요청에 위치 붙이기 공통) */
export type CapturedPoint = { latitude: number; longitude: number; accuracyM: number | null; capturedAt: string };
export type CaptureFailure = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE';

/** 이 시간보다 오래 걸리면 위치 없이 보낸다. 서버의 위치 요청 제한 시간(30초)보다 짧게 */
const CAPTURE_TIMEOUT_MS = 15000;
/** 1분 안에 잰 위치가 100m 안쪽으로 정확하면 새로 재지 않고 쓴다 */
const LAST_KNOWN = { maxAge: 60_000, requiredAccuracy: 100 };

let cachedPermission: LocationPermission = 'denied';

/** 마지막으로 읽은 권한. 도움 요청을 보낼 때 기다리지 않고 바로 판단하려고 둔다 */
export function lastPermission(): LocationPermission {
  return cachedPermission;
}

async function backgroundGranted() {
  try {
    return (await Location.getBackgroundPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

async function toPermission(response: Location.LocationPermissionResponse): Promise<LocationPermission> {
  if (!response.granted) return 'denied';
  // 대략적인 위치만 허용했으면 따로 표시
  if (response.android?.accuracy === 'coarse') return 'approximate';
  // '항상 허용'이면 앱이 꺼져 있어도 보호자의 위치 확인에 답할 수 있다
  return (await backgroundGranted()) ? 'granted' : 'whileInUse';
}

export async function readPermission(): Promise<LocationPermission> {
  try {
    cachedPermission = await toPermission(await Location.getForegroundPermissionsAsync());
  } catch {
    cachedPermission = 'denied';
  }
  return cachedPermission;
}

/**
 * 위치 권한을 묻는다. 앱 사용 중 허용을 받은 뒤 '항상 허용'도 묻는다.
 * 안드로이드 11부터 '항상 허용'은 창이 아니라 휴대폰 설정 화면에서 고른다.
 */
export async function askPermission(): Promise<LocationPermission> {
  try {
    const foreground = await Location.requestForegroundPermissionsAsync();
    if (foreground.granted && !(await backgroundGranted())) {
      await Location.requestBackgroundPermissionsAsync().catch(() => null);
    }
  } catch {
    // 아래에서 다시 읽는다
  }
  return readPermission();
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      () => { clearTimeout(timer); resolve(null); },
    );
  });
}

function toPoint(position: Location.LocationObject): CapturedPoint {
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracyM: position.coords.accuracy == null ? null : Math.round(position.coords.accuracy),
    capturedAt: new Date(position.timestamp).toISOString(),
  };
}

/**
 * 지금 위치를 한 번 잰다. 권한을 새로 묻지 않는다(설정 화면에서만 묻는다).
 * background: 앱이 꺼진 채로 재는 경우. '항상 허용'이 아니면 재지 않는다.
 */
export async function captureOnce(options: { background?: boolean } = {}): Promise<CapturedPoint | CaptureFailure> {
  const permission = await readPermission();
  if (permission === 'denied' || (options.background && permission !== 'granted')) return 'PERMISSION_DENIED';
  try {
    const recent = await Location.getLastKnownPositionAsync(LAST_KNOWN);
    if (recent) return toPoint(recent);
  } catch {
    // 새로 잰다
  }
  const current = await withTimeout(
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced, mayShowUserSettingsDialog: false }),
    CAPTURE_TIMEOUT_MS,
  );
  return current ? toPoint(current) : 'POSITION_UNAVAILABLE';
}
