import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/** 화면에 있는 동안 ms 뒤 한 번 실행. 화면을 떠나면 취소 */
export function useTimeout(callback: () => void, ms: number | null) {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useFocusEffect(useCallback(() => {
    if (ms === null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => { clearTimeout(timer); timer = setTimeout(() => ref.current(), ms); };
    if (!AppState.currentState || AppState.currentState === 'active') start();
    const subscription = AppState.addEventListener('change', (state) => {
      clearTimeout(timer);
      if (state === 'active') start();
    });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, [ms]));
}
