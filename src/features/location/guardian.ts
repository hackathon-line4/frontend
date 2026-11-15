import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';

import { ApiError } from '@/api';
import { getGuardianScope } from '@/features/guardian/client';
import type { RecipientLocation } from '@/features/home/types';
import { locationApi, type LastLocation, type LocationView } from './api';

const POLL_MS = 2000;
/** 서버 제한 시간(30초)이 지나도 답이 없으면 그만 기다린다 */
const GIVE_UP_MS = 40000;

const pad = (n: number) => String(n).padStart(2, '0');

/** 주소가 아직 없으면 좌표를 짧게 보여 준다 */
export function locationText(last: Pick<LastLocation, 'address' | 'latitude' | 'longitude'>) {
  return last.address ?? `위도 ${last.latitude.toFixed(5)}, 경도 ${last.longitude.toFixed(5)}`;
}

/** 서버 위치 → 홈 카드 · 위치 탭이 쓰는 모양 */
export function toRecipientLocation(view: Pick<LocationView, 'sharingEnabled' | 'last'> | null | undefined, now = Date.now()): RecipientLocation {
  const last = view?.sharingEnabled ? view.last : null;
  if (!view?.sharingEnabled) {
    return { sharing: false, updatedAt: '', minutesAgo: 0, address: '', addressSummary: '', accuracyMeters: 0 };
  }
  if (!last) {
    return { sharing: true, updatedAt: '', minutesAgo: 0, address: '', addressSummary: '아직 받은 위치가 없어요', accuracyMeters: 0 };
  }
  const at = new Date(last.capturedAt);
  const text = locationText(last);
  return {
    sharing: true,
    updatedAt: `${pad(at.getHours())}:${pad(at.getMinutes())}`,
    minutesAgo: Math.max(0, Math.floor((now - at.getTime()) / 60000)),
    address: text,
    addressSummary: text,
    accuracyMeters: last.accuracyM ?? 0,
    point: { latitude: Number(last.latitude), longitude: Number(last.longitude) },
  };
}

/** 휴대폰에 있는 지도 앱으로 연다 (지도 SDK · API 키 없이) */
export async function openInMaps(point: { latitude: number; longitude: number }, label: string) {
  const q = `${point.latitude},${point.longitude}`;
  const native = Platform.OS === 'android'
    ? `geo:${q}?q=${q}(${encodeURIComponent(label)})`
    : `maps:?q=${encodeURIComponent(label)}&ll=${q}`;
  try {
    await Linking.openURL(native);
  } catch {
    await Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${q}`).catch(() => {});
  }
}

const refreshMessage = (error: unknown) => {
  if (error instanceof ApiError && error.code === 'LOCATION_SHARING_OFF') return '당사자가 위치 공유를 꺼 두었어요';
  return '위치를 요청하지 못했어요. 잠시 뒤 다시 눌러 주세요';
};

/** 보호자 위치 탭 */
export function useGuardianLocation() {
  const [view, setView] = useState<LocationView | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const poll = useRef<ReturnType<typeof setTimeout> | null>(null);
  const alive = useRef(true);

  const stopPolling = () => { if (poll.current) clearTimeout(poll.current); poll.current = null; };

  const load = useCallback(async () => {
    const scope = getGuardianScope();
    if (!scope) { setLoading(false); return null; }
    try {
      const next = await locationApi.view(scope.linkId);
      if (alive.current) setView(next);
      return next;
    } catch {
      if (alive.current) setNotice('위치를 불러오지 못했어요');
      return null;
    } finally {
      if (alive.current) setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    alive.current = true;
    void load();
    return () => { alive.current = false; stopPolling(); };
  }, [load]));

  useEffect(() => () => stopPolling(), []);

  const refresh = useCallback(async () => {
    const scope = getGuardianScope();
    if (!scope || refreshing) return;
    setNotice(null);
    setRefreshing(true);
    const before = view?.last?.capturedAt ?? null;
    try {
      const request = await locationApi.refresh(scope.linkId);
      const startedAt = Date.now();
      const tick = async () => {
        if (!alive.current) return;
        const next = await load();
        const answered = next?.last && next.last.capturedAt !== before;
        const pending = next?.pendingRequest?.id === request.id && next.pendingRequest.status === 'PENDING';
        if (answered || (!pending && next) || Date.now() - startedAt > GIVE_UP_MS) {
          if (!answered && alive.current) setNotice('당사자 휴대폰에서 위치를 받지 못했어요. 앱이 꺼져 있으면 마지막 위치만 보여요');
          setRefreshing(false);
          return;
        }
        poll.current = setTimeout(() => { void tick(); }, POLL_MS);
      };
      poll.current = setTimeout(() => { void tick(); }, POLL_MS);
    } catch (error) {
      setNotice(refreshMessage(error));
      setRefreshing(false);
    }
  }, [load, refreshing, view]);

  return { view, loading, refreshing, notice, refresh };
}
