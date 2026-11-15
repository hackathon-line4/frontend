import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { ApiError } from '@/api';
import { signupFailure } from '@/features/auth/errors';
import { getSession, sessionHref, signup } from '@/features/session';
import SignupScreen, { type SignupForm } from '@/screens/auth/SignupScreen';

export default function SignupRoute() {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<{ message: string; field?: string }>();
  const submitting = useRef(false);
  const retry = useRef<{ body: string; key: string } | undefined>(undefined);
  const submit = async (form: SignupForm) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setFailure(undefined);
    const body = JSON.stringify(form);
    try {
      await signup(form, retry.current?.body === body ? retry.current.key : undefined);
      retry.current = undefined;
      if (getSession().status === 'authenticated') router.replace(sessionHref());
    } catch (error) {
      if (getSession().status === 'error' && getSession().tokens) { router.replace('/'); return; }
      if (error instanceof ApiError && error.idempotencyKey) retry.current = { body, key: error.idempotencyKey };
      setFailure(signupFailure(error));
    } finally { submitting.current = false; setBusy(false); }
  };
  return <SignupScreen onSubmit={(form) => { void submit(form); }} onFormChange={() => setFailure(undefined)} busy={busy} error={failure?.message} errorField={failure?.field} onBack={() => router.back()} onLogin={() => router.replace('/auth/login')} />;
}
