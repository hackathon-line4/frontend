import { useSyncExternalStore } from 'react';

import { errorMessage } from '@/api';

import { getGuardianScope, guardianApi, guardianStore } from './client';
import { useGuardianState } from './hooks';

/** 홈의 자주 쓰는 신호는 최대 6개 (서버 FAVORITE_LIMIT) */
export const FAVORITE_LIMIT = 6;

// 자주 쓰는 신호(홈) 별 토글. 홈 · 신호 목록 · 신호 상세가 모두 이 값을 본다.
// 낙관적 업데이트: 누르는 즉시 pending에 반영하고, 서버 저장은 뒤에서 한다.
// 여러 번 빠르게 눌러도 마지막 상태만 반영되고, 실패하면 서버 값으로 되돌린다.

type FavoriteState = {
  /** 저장 중인(서버 확인 전) 목록. null이면 서버 값(홈 요약)을 그대로 쓴다 */
  pending: readonly string[] | null;
  notice?: string;
};

let state: FavoriteState = { pending: null };
let sequence = 0;
const listeners = new Set<() => void>();

let noticeTimer: ReturnType<typeof setTimeout> | undefined;

function set(next: Partial<FavoriteState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
  // 안내 문구는 홈 · 목록 · 상세가 같이 보므로 잠깐만 보여 주고 지운다
  if (next.notice) {
    clearTimeout(noticeTimer);
    const shown = next.notice;
    noticeTimer = setTimeout(() => { if (state.notice === shown) set({ notice: undefined }); }, 3000);
  }
}
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getState = () => state;

async function save(next: readonly string[], on: boolean) {
  const scope = getGuardianScope();
  if (!scope) return;
  const mine = ++sequence;
  set({ pending: next, notice: undefined });
  try {
    await guardianApi.setFavorites(scope.linkId, [...next]);
    await guardianStore.loadHome(true);
    // 그 사이에 또 눌렀으면 그 요청이 마무리한다
    if (mine !== sequence) return;
    set({ pending: null, notice: on ? '자주 쓰는 신호에서 뺐어요' : '홈의 자주 쓰는 신호에 추가했어요' });
  } catch (failure) {
    if (mine !== sequence) return;
    // 서버 값으로 되돌린다
    set({ pending: null, notice: errorMessage(failure) });
  }
}

export function useFavoriteSignals() {
  const { data, scope } = useGuardianState();
  const favorite = useSyncExternalStore(subscribe, getState, getState);
  const serverIds = data?.home?.favoriteSignals.map((s) => s.id) ?? [];
  const ids = favorite.pending ?? serverIds;
  const ready = !!scope && !!data?.home;

  const toggle = (id: string) => {
    if (!ready) return;
    const on = ids.includes(id);
    if (!on && ids.length >= FAVORITE_LIMIT) {
      set({ notice: `자주 쓰는 신호는 ${FAVORITE_LIMIT}개까지 고를 수 있어요. 다른 신호의 별을 먼저 빼 주세요.` });
      return;
    }
    void save(on ? ids.filter((f) => f !== id) : [...ids, id], on);
  };

  return { ready, ids, isFavorite: (id: string) => ids.includes(id), toggle, busy: false, notice: favorite.notice };
}
