import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';
import { errorMessage } from '@/api/errors';
import { useSession } from '@/features/session/store';
import { getGuardianScope, guardianStore } from './client';

export function useGuardianState() {
  useSession();
  const snapshot = useSyncExternalStore(guardianStore.subscribe, guardianStore.getSnapshot, guardianStore.getSnapshot);
  const scope = getGuardianScope();
  const key = scope?.key;
  useFocusEffect(useCallback(() => { guardianStore.bind(); if (key) void guardianStore.refresh(); }, [key]));
  return { data: scope?.key === snapshot.scope ? snapshot : null, scope };
}
export function useGuardianMessage(id: string | undefined) {
  const { data, scope } = useGuardianState();
  const key = scope?.key;
  useFocusEffect(useCallback(() => {
    if (!id || !key) return;
    void guardianStore.loadMessage(id);
    return guardianStore.watchMessage(id);
  }, [id, key]));
  return data?.messages[id ?? ''];
}
export function useGuardianMutation() {
  const active = useRef<AbortController | null>(null);
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  useFocusEffect(useCallback(() => {
    const activate = () => { active.current = new AbortController(); running.current = false; setBusy(false); };
    if (!AppState.currentState || AppState.currentState === 'active') activate();
    const sub = AppState.addEventListener('change', state => { active.current?.abort(); active.current = null; if (state === 'active') activate(); });
    return () => { active.current?.abort(); active.current = null; sub.remove(); };
  }, []));
  async function run<T>(job: (signal: AbortSignal) => Promise<T>): Promise<T | undefined> {
    const scope = active.current;
    if (!scope || scope.signal.aborted || running.current) return;
    running.current = true; setBusy(true); setError(undefined);
    try { const result = await job(scope.signal); if (active.current === scope && !scope.signal.aborted) return result; }
    catch (failure) { if (active.current === scope && !scope.signal.aborted) setError(errorMessage(failure)); }
    finally { if (active.current === scope && !scope.signal.aborted) { running.current = false; setBusy(false); } }
  }
  return { run, busy, error };
}
