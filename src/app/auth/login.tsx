import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { ApiError, errorMessage } from '@/api';
import { getSession, login, sessionHref, useSession } from '@/features/session';
import { playWaveform } from '@/native/vibration';
import LoginScreen from '@/screens/auth/LoginScreen';

export default function LoginRoute() {
  const session = useSession();
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [retryUntil, setRetryUntil] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const submitting = useRef(false);
  useEffect(() => {
    if (!retryUntil) return;
    const tick = () => setRemaining(Math.max(0, Math.ceil((retryUntil - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [retryUntil]);
  const submit = async ({ email, password }: { email: string; password: string }) => {
    if (submitting.current || Date.now() < retryUntil) return;
    submitting.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await login(email, password);
      if (getSession().status === 'authenticated') router.replace(sessionHref());
    } catch (failure) {
      if (getSession().status === 'error' && getSession().tokens) { router.replace('/'); return; }
      const message = errorMessage(failure);
      setError(message);
      AccessibilityInfo.announceForAccessibility(message);
      if (failure instanceof ApiError && failure.code === 'INVALID_CREDENTIALS') {
        playWaveform({ timings: [0, 80, 80, 80, 80, 80], amplitudes: [0, 120, 0, 120, 0, 120] });
      }
      if (failure instanceof ApiError && failure.code === 'TOO_MANY_ATTEMPTS') {
        const seconds = failure.details?.retryAfterSec;
        if (typeof seconds === 'number' && seconds > 0) {
          setRemaining(Math.ceil(seconds));
          setRetryUntil(Date.now() + seconds * 1000);
        }
      }
    } finally { submitting.current = false; setBusy(false); }
  };
  return <LoginScreen onLogin={(form) => { void submit(form); }} busy={busy} retryAfterSec={remaining} error={error ?? session.error ?? undefined} onSignup={() => router.push('/auth/signup')} />;
}
