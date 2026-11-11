import { randomUUID } from 'expo-crypto';
import { api } from '@/api';
import { getSession, getSessionRevision } from '@/features/session/store';
import { playFeedback } from '@/features/vibration';
import { createGuardianApi } from './api';
import { createGuardianStore } from './store';
import type { GuardianScope } from './types';

export function getGuardianScope(): GuardianScope | null {
  const session = getSession();
  if (session.status !== 'authenticated' || session.role !== 'guardian' || !session.tokens || !session.user) return null;
  const link = session.links.find(link => link.status === 'ACTIVE' && link.guardian.id === session.user!.id);
  return link ? { key: `${session.user.id}:${getSessionRevision()}:${link.id}`, linkId: link.id, userId: session.user.id } : null;
}
export const guardianApi = createGuardianApi(api);
export const guardianStore = createGuardianStore({ api: guardianApi, scope: getGuardianScope, createKey: randomUUID, feedback: playFeedback });
