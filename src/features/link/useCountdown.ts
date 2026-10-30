import { useEffect, useState } from 'react';

/** 마감 시각까지 남은 초. 0이 되면 멈춘다. */
export function useCountdown(deadline: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const tick = () => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) clearInterval(interval);
    };
    // 마감 시각이 바뀌면(새 코드) 바로 한 번 갱신
    const first = setTimeout(tick, 0);
    interval = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [deadline]);

  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

/** 582 → '9:42' */
export function formatMinutes(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
