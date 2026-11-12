import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { ApiError, errorMessage } from '@/api';

// Poll only the visible foreground screen. Mutation results supersede in-flight reads.
export function useLinkResource<T>(load: (signal: AbortSignal) => Promise<T>, poll = false) {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const scope = useRef<{ active: boolean; version: number; reading: boolean; writing: boolean; controller?: AbortController } | null>(null);
  const refresh = useRef<() => void>(() => {});
  useFocusEffect(useCallback(() => {
    const current = { active: true, version: 0, reading: false, writing: false, controller: undefined as AbortController | undefined };
    scope.current = current;
    const read = async () => {
      if (!current.active || current.reading || current.writing || (AppState.currentState && AppState.currentState !== 'active')) return;
      current.reading = true;
      const version = current.version;
      const controller = new AbortController();
      current.controller = controller;
      try {
        const result = await load(controller.signal);
        if (current.active && version === current.version) { setData(result); setError(undefined); }
      } catch (failure) {
        if (current.active && version === current.version && !(failure instanceof ApiError && failure.code === 'ABORTED')) setError(errorMessage(failure));
      } finally {
        current.reading = false;
        if (current.active && version === current.version) setReady(true);
      }
    };
    setData(undefined); setError(undefined); setReady(false); setBusy(false);
    refresh.current = () => { void read(); };
    void read();
    const timer = poll ? setInterval(() => { void read(); }, 5000) : undefined;
    const subscription = AppState.addEventListener('change', (state) => { if (state === 'active') void read(); });
    return () => { current.active = false; current.controller?.abort(); clearInterval(timer); subscription.remove(); };
  }, [load, poll]));

  const run = async <R,>(operation: () => Promise<R>, accept: (result: R) => void) => {
    const current = scope.current;
    if (!current?.active || current.writing) return;
    current.writing = true; current.version++; current.controller?.abort();
    setBusy(true); setError(undefined);
    try {
      const result = await operation();
      if (current.active) accept(result);
    } catch (failure) { if (current.active) setError(errorMessage(failure)); }
    finally { current.writing = false; if (current.active) { setBusy(false); setReady(true); } }
  };
  return { data, setData, error, busy, ready, retry: () => refresh.current(), run };
}
