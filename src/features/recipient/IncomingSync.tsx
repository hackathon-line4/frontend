import { useEffect } from 'react';
import { AppState } from 'react-native';

import { getSessionRevision, useSession } from '@/features/session/store';

import { recipientApi } from './api';
import { getCurrentIncoming, handleIncoming, hasHandledIncoming, openNextIncoming } from './incoming';

/** Recover missed pushes while the recipient app is open. SSE/FCM use the same deduplicated entry. */
export function IncomingSync() {
  const session = useSession();
  const revision = getSessionRevision();
  const enabled = session.status === 'authenticated' && session.role === 'recipient' && !!session.tokens &&
    session.links.some((link) => link.status === 'ACTIVE');
  useEffect(() => {
    if (!enabled) return;
    let alive = true;
    let controller: AbortController | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const foreground = () => !AppState.currentState || AppState.currentState === 'active';
    const read = async () => {
      if (!alive || !foreground() || revision !== getSessionRevision()) return;
      const request = new AbortController(); controller = request;
      try {
        if (!getCurrentIncoming()) {
          if (openNextIncoming()) return;
          const messages = await recipientApi.incoming(request.signal);
          if (!alive || request.signal.aborted || revision !== getSessionRevision() || getCurrentIncoming()) return;
          const next = messages.find((item) => !hasHandledIncoming(item.id));
          if (next) handleIncoming(next);
        }
      } catch {
        // A missed/failed read is retried while foregrounded; it must not fake an incoming signal.
      } finally {
        if (alive && !request.signal.aborted && foreground()) timer = setTimeout(() => { void read(); }, 5000);
      }
    };
    if (foreground()) void read();
    const subscription = AppState.addEventListener('change', (state) => {
      controller?.abort(); clearTimeout(timer);
      if (state === 'active') void read();
    });
    return () => { alive = false; controller?.abort(); clearTimeout(timer); subscription.remove(); };
  }, [enabled, revision]);
  return null;
}
