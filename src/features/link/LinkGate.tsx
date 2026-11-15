import { Redirect, Stack } from 'expo-router';

import { sessionHref, useSession, type Role } from '@/features/session';

export function LinkGate({ role }: { role: Role }) {
  const session = useSession();
  if (session.status === 'loading' || session.status === 'error') return <Redirect href="/" />;
  if (session.status !== 'authenticated' || session.role !== role) return <Redirect href={sessionHref(session)} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
