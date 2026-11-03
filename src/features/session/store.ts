import { useSyncExternalStore } from 'react';

// 로그인 사용자의 역할. 나중에 서버(로그인/내 정보 API) 응답으로 채운다.
// React 밖(API 클라이언트 등)에서도 setRole로 바꿀 수 있게 작은 외부 스토어로 둔다.

export type Role = 'guardian' | 'recipient';

type SessionState = {
  role: Role | null;
};

let state: SessionState = {
  // TODO: 앱 시작 시 저장된 세션/서버 응답으로 복원
  role: null,
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function getSession(): SessionState {
  return state;
}

export function setRole(role: Role | null) {
  if (state.role === role) return;
  state = { ...state, role };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSession(): SessionState {
  return useSyncExternalStore(subscribe, getSession, getSession);
}

export function useRole(): Role | null {
  return useSession().role;
}

/** 역할별 첫 화면 */
export function homeHref(role: Role | null) {
  if (role === 'guardian') return '/guardian' as const;
  if (role === 'recipient') return '/recipient' as const;
  return '/auth/role' as const;
}
