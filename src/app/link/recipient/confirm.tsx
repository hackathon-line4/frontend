import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { api, ApiError, errorMessage } from '@/api';
import { Button, Screen, Text } from '@/components';
import { mockGuardian } from '@/features/link/mock';
import { getSession, reloadMe, sessionHref, useSession } from '@/features/session';
import RecipientConfirmScreen from '@/screens/link/RecipientConfirmScreen';

export default function RecipientConfirmRoute() {
  const { pendingLinkRequest } = useSession();
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!pendingLinkRequest) return;
    let active = true;
    let checking = false;
    const check = async () => {
      if (checking || AppState.currentState !== 'active') return;
      checking = true;
      try {
        await reloadMe();
        if (active && getSession().status === 'authenticated' && !getSession().pendingLinkRequest) router.replace(sessionHref());
      } catch (failure) { if (active) setError(errorMessage(failure)); }
      finally { checking = false; }
    };
    const timer = setInterval(() => { void check(); }, 5000);
    return () => { active = false; clearInterval(timer); };
  }, [pendingLinkRequest?.id, pendingLinkRequest]);
  const cancel = async () => {
    if (!pendingLinkRequest) { setWaiting(false); return; }
    if (busy) return;
    setBusy(true);
    try {
      try { await api.request(`/link-requests/${encodeURIComponent(pendingLinkRequest.id)}/cancel`, { method: 'POST' }); }
      catch (failure) {
        if (!(failure instanceof ApiError) || failure.code !== 'LINK_REQUEST_NOT_PENDING') throw failure;
      }
      await reloadMe();
      if (getSession().status === 'authenticated') router.replace(sessionHref());
    } catch (failure) { setError(errorMessage(failure)); }
    finally { setBusy(false); }
  };
  if (error || busy) return <Screen gap={4} reserveHeader="lg">
    <Text accessibilityRole={error ? 'alert' : undefined}>{error ?? '요청을 취소하고 있어요…'}</Text>
    {error && <Button label="대기 화면으로" onPress={() => setError(undefined)} />}
  </Screen>;
  return <RecipientConfirmScreen guardianName={pendingLinkRequest?.guardian.name ?? mockGuardian.name} waiting={!!pendingLinkRequest || waiting} onConfirm={() => setWaiting(true)} onCancel={() => { void cancel(); }} />;
}
