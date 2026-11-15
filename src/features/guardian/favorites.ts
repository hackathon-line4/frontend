import { useState } from 'react';

import { guardianApi, guardianStore } from './client';
import { useGuardianMutation, useGuardianState } from './hooks';

/** 홈의 자주 쓰는 신호는 최대 6개 (서버 FAVORITE_LIMIT) */
export const FAVORITE_LIMIT = 6;

/**
 * 자주 쓰는 신호(홈) 별 토글. 신호 목록 · 신호 상세에서 같이 쓴다.
 * 보호자가 별을 누른 신호만 홈에 보인다 (기본으로 채우지 않음).
 */
export function useFavoriteSignals() {
  const { data, scope } = useGuardianState();
  const mutation = useGuardianMutation();
  const [notice, setNotice] = useState<string>();
  const ids = data?.home?.favoriteSignals.map((s) => s.id) ?? [];
  const ready = !!scope && !!data?.home;

  const toggle = (id: string) => {
    if (!scope || !ready) return;
    setNotice(undefined);
    const on = ids.includes(id);
    if (!on && ids.length >= FAVORITE_LIMIT) {
      setNotice(`자주 쓰는 신호는 ${FAVORITE_LIMIT}개까지 고를 수 있어요. 다른 신호의 별을 먼저 빼 주세요.`);
      return;
    }
    const next = on ? ids.filter((f) => f !== id) : [...ids, id];
    void mutation.run(async (abort) => {
      await guardianApi.setFavorites(scope.linkId, next, abort);
      await guardianStore.loadHome(true);
      setNotice(on ? '자주 쓰는 신호에서 뺐어요' : '홈의 자주 쓰는 신호에 추가했어요');
    });
  };

  return { ready, ids, isFavorite: (id: string) => ids.includes(id), toggle, busy: mutation.busy, notice: notice ?? mutation.error };
}
