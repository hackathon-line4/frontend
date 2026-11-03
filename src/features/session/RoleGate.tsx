import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { homeHref, useRole, type Role } from './store';

// 역할별 화면 묶음(app/guardian, app/recipient)의 입구. 다른 역할이면 그 역할의 첫 화면으로 보낸다.
export function RoleGate({ role, children }: { role: Role; children: ReactNode }) {
  const current = useRole();
  if (current !== role) return <Redirect href={homeHref(current)} />;
  return children;
}
