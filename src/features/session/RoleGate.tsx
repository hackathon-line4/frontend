import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { sessionHref, useSession, type Role } from './store';

// 역할별 화면 묶음(app/guardian, app/recipient)의 입구. 다른 역할이면 그 역할의 첫 화면으로 보낸다.
export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const session = useSession();
  if (session.status === 'loading' || session.status === 'error') return <Redirect href="/" />;
  if (__DEV__ && !session.tokens && session.role === role) return children;
  if (session.status !== 'authenticated' || session.role !== role || (session.role === 'recipient' && session.pendingLinkRequest)) return <Redirect href={sessionHref(session)} />;
  return children;
}
