import { useEffect } from 'react';
import { AppState } from 'react-native';
import { api } from '@/api';
import { guardianStore } from '@/features/guardian/client';
import { answerLocationRequest } from '@/features/location/recipient';
import { handleIncoming } from '@/features/recipient/incoming';
import { recoverIncoming } from '@/features/recipient/recover';
import { getSession, getSessionRevision, reloadMe, useSession } from '@/features/session/store';
import { createRealtimeClient } from './client';
import { createEventDispatcher } from './dispatch';

/** Exactly one stream per signed-in account, across all screens. */
export function RealtimeSync() {
  const session = useSession();
  const revision = getSessionRevision();
  const owner = session.status === 'authenticated' && session.tokens && session.role && session.user ? `${session.user.id}:${revision}` : null;
  useEffect(() => {
    guardianStore.bind();
    if (!owner) return;
    const valid = () => getSessionRevision() === revision && getSession().status === 'authenticated';
    let foreground: AbortController | undefined;
    let fallback: ReturnType<typeof setInterval> | undefined;
    let signalReadAt = 0;
    const refresh = () => {
      if (!valid() || !foreground || foreground.signal.aborted) return;
      void guardianStore.refresh();
      if (getSession().role === 'guardian' && Date.now() - signalReadAt > 30000) { signalReadAt = Date.now(); void guardianStore.loadSignals(); }
    };
    const dispatcher = createEventDispatcher({ valid, role: () => getSession().role,
      onMessage: message => guardianStore.ingest(message), onIncoming: handleIncoming,
      onSession: () => { void reloadMe().catch(() => {}); }, onRefresh: () => guardianStore.scheduleRefresh(),
      onLocationRequest: requestId => { void answerLocationRequest(requestId); } });
    const stream = createRealtimeClient({ valid, open: (signal, cursor) => api.openStream('/events', signal, cursor),
      onEvent: dispatcher,
      onConnected: () => {
        refresh(); void reloadMe().catch(() => {});
        void recoverIncoming(foreground?.signal).catch(() => {});
      } });
    const pause = () => {
      foreground?.abort(); foreground = undefined; clearInterval(fallback); stream.stop(); guardianStore.stop();
    };
    const resume = () => {
      if (foreground || !valid()) return;
      foreground = new AbortController(); refresh(); stream.start();
      // Recovery also covers the current backend dev, whose domain SSE publishing is not merged yet.
      fallback = setInterval(refresh, 5000);
    };
    if (!AppState.currentState || AppState.currentState === 'active') resume();
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') resume(); else pause(); });
    return () => { subscription.remove(); pause(); };
  }, [owner, revision]);
  return null;
}
