import { useEffect, useRef } from 'react';

/** 화면에 있는 동안 ms 뒤 한 번 실행. 화면을 떠나면 취소 */
export function useTimeout(callback: () => void, ms: number) {
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  }, [callback]);

  useEffect(() => {
    const id = setTimeout(() => ref.current(), ms);
    return () => clearTimeout(id);
  }, [ms]);
}
