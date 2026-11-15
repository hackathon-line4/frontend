import { getSession, getSessionRevision } from '@/features/session/store';
import { recipientApi } from './api';
import { getCurrentIncoming, handleIncoming, hasHandledIncoming, openNextIncoming } from './incoming';

export async function recoverIncoming(signal?: AbortSignal) {
  const revision = getSessionRevision(), session = getSession();
  if (session.status !== 'authenticated' || session.role !== 'recipient' || getCurrentIncoming()) return;
  if (openNextIncoming()) return;
  const messages = await recipientApi.incoming(signal);
  if (signal?.aborted || revision !== getSessionRevision() || getCurrentIncoming()) return;
  const next = messages.find(item => !hasHandledIncoming(item.id));
  if (next) handleIncoming(next);
}
