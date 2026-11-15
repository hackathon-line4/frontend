import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';

import { ApiError, errorMessage } from '@/api';
import { Button, Screen, Text } from '@/components';
import { getSession, reloadMe, selectRole, sessionHref, useSession, type Role } from '@/features/session';
import RoleSelectScreen from '@/screens/auth/RoleSelectScreen';

export default function RoleRoute() {
  const session = useSession();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const submitting = useRef(false);
  const submit = async (role: Role) => {
    if (submitting.current) return;
    submitting.current = true;
    setBusy(true);
    setError(undefined);
    try {
      try { await selectRole(role); }
      catch (failure) {
        if (!(failure instanceof ApiError) || failure.code !== 'ROLE_ALREADY_SET') throw failure;
        await reloadMe();
      }
      if (getSession().status === 'authenticated') router.replace(sessionHref());
    } catch (failure) { setError(errorMessage(failure)); }
    finally { submitting.current = false; setBusy(false); }
  };
  if (session.status === 'loading' || session.status === 'error') return <Redirect href="/" />;
  if (session.status !== 'authenticated') return <Redirect href="/auth/login" />;
  if (session.role && !busy && !error) return <Redirect href={sessionHref(session)} />;
  if (busy || error) return <Screen gap={4} reserveHeader="lg">
    <Text accessibilityRole={error ? 'alert' : undefined}>{error ?? '역할을 저장하고 있어요…'}</Text>
    {error && <Button label="다시 선택" onPress={() => setError(undefined)} />}
  </Screen>;
  return <RoleSelectScreen onSelect={(role) => { void submit(role); }} />;
}
